require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./database');
const crypto = require('crypto');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const logActivity = require('./utils/logActivity');
const User = require('./models/User');
const Message = require('./models/Message');
const Secret = require('./models/Secret');
const Incident = require('./models/Incident');
const ActivityLog = require('./models/ActivityLog');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

const algorithm = 'aes-256-ctr';

if (!process.env.SECRET_KEY || !process.env.IV) {
    throw new Error('Missing SECRET_KEY or IV in environment variables');
}

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');
console.log(secretKey)
console.log(iv)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrypted.toString();
};


// Basic route
app.get('/', (req, res) => {
    res.send('OffChat Server');
});

// Endpoint to get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.findAll();
        res.json(messages);
    } catch (error) {
        res.status(500).send('Error retrieving messages');
    }
});

// Endpoint to get pinned messages
app.get('/api/pinned-messages', async (req, res) => {
    try {
        const pinnedMessages = await Message.findAll({ where: { pinned: true } });
        res.json(pinnedMessages);
    } catch (error) {
        res.status(500).send('Error retrieving pinned messages');
    }
});

app.post('/api/secrets', async (req, res) => {
    const { username, title, secret } = req.body;
    const encryptedSecret = encrypt(secret); // Assume encrypt function is defined
    try {
        const newSecret = await Secret.create({ username, title, secret: JSON.stringify(encryptedSecret) });
        logActivity(username, 'Saved Secret', `Saved secret with title: ${title}`);
        res.status(201).json(newSecret);
    } catch (error) {
        res.status(500).send('Error saving secret');
    }
});

app.get('/api/secrets/:title', async (req, res) => {
    const { username, title } = req.params;
    try {
        const secret = await Secret.findOne({ where: { title } });
        if (secret) {
            res.json({ secret: JSON.parse(secret.secret) });
            logActivity(username, 'Secret Retrieved', `Retrieved secret with title: ${title}`);
        } else {
            res.status(404).send('Secret not found');
        }
    } catch (error) {
        res.status(500).send('Error retrieving secret');
    }
});

app.post('/api/activitylogs', async (req, res) => {
    const { user, action_type, details, related_entity } = req.body;
    try {
        const newActivity = await ActivityLog.create({ user, action_type, details, related_entity });
        io.emit('newActivityLog', newActivity); // Emit WebSocket event
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).send('Error logging activity');
    }
});

app.get('/api/activitylogs', async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10 if not specified
    try {
        const activityLogs = await ActivityLog.findAll({
            order: [['createdAt', 'DESC']],
            limit: limit
        });
        res.json(activityLogs);
    } catch (error) {
        res.status(500).send('Error retrieving activity logs');
    }
});

app.get('/api/incidents', async (req, res) => {
    try {
        const incidents = await Incident.findAll();
        res.json(incidents);
    } catch (error) {
        res.status(500).send('Error retrieving incidents');
    }
});

app.post('/api/incidents', async (req, res) => {
    const { ttp, description, severity, status, tags, assigned_user, username } = req.body;
    try {
        const newIncident = await Incident.create({ ttp, description, severity, status, tags, assigned_user });
        logActivity(username, 'Create Incident', `Created incident with TTP: ${ttp}`, newIncident.id);
        res.status(201).json(newIncident);
    } catch (error) {
        res.status(500).send('Error creating incident');
    }
});

app.get('/api/incidents/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const incident = await Incident.findOne({ where: { id } });
        if (incident) {
            res.json(incident);
        } else {
            res.status(404).send('Incident not found');
        }
    } catch (error) {
        res.status(500).send('Error retrieving incident');
    }
});

app.delete('/api/incidents/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Incident.destroy({ where: { id } });
        logActivity('System', 'Delete Incident', `Deleted incident with ID: ${id}`);
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Error deleting incident');
    }
});


// Socket.IO connection
io.on('connection', (socket) => {

    socket.on('message', async (data) => {
        const { username, content } = data;
        try {
            const message = await Message.create({ username, content });
            io.emit('message', message);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('stop typing', data);
    });

    socket.on('pin', async (data) => {
        try {
            await Message.update({ pinned: true }, { where: { id: data.id } });
            io.emit('pin', data);
        } catch (error) {
            console.error('Error pinning message:', error);
        }
    });

    socket.on('unpin', async (data) => {
        try {
            await Message.update({ pinned: false }, { where: { id: data.id } });
            io.emit('unpin', data);
        } catch (error) {
            console.error('Error unpinning message:', error);
        }
    });

    socket.on('secret', async (data) => {
        const { username, title, secret } = data;
        const encryptedSecret = encrypt(secret);
        try {
            const newSecret = await Secret.create({ username, title, secret: JSON.stringify(encryptedSecret) });
            socket.emit('secret saved', { message: 'Secret saved successfully' });
            logActivity(username, 'Save Secret', `Saved secret with title: ${title}`);
        } catch (error) {
            console.error('Error saving secret:', error);
            socket.emit('secret save error', { message: 'Error saving secret' });
        }
    });

    socket.on('getsecret', async (data) => {
        const { username, title } = data;
        try {
            const secret = await Secret.findOne({ where: { title } });
            if (secret) {
                const decryptedSecret = decrypt(JSON.parse(secret.secret));
                socket.emit('secret fetched', { title, secret: decryptedSecret });
                logActivity(username, 'Secret Retrieved', `Retrieved secret with title: ${title}`);
            } else {
                socket.emit('secret was not found');
            }
        } catch (error) {
            console.error('Error retrieving secret:', error);
            socket.emit('secret fetch error');
        }
    });

    socket.on('listsecrets', async (data) => {
        const { username } = data;
        try {
            const secrets = await Secret.findAll({
                attributes: ['title']
            });
            const secretTitles = secrets.map(secret => secret.title);
            socket.emit('secrets listed', { secrets: secretTitles });
            logActivity(username, 'List Secrets', 'Listed all available secrets');
        } catch (error) {
            console.error('Error listing secrets:', error);
            socket.emit('list secrets error');
        }
    });

});

// Sync database and start server
sequelize.sync()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log('Error syncing database:', err));
