# OffChat  
  
OffChat is a secure chat application designed for offensive security teams to communicate during engagements. The app offers features to streamline evidence gathering, manage incidents, and track activities.  
  
## Features  
  
• Secure Messaging: End-to-end encrypted messaging between team members.  
• Incident Management: Log and track security incidents with details such as TTP, description, severity, status, tags, and assigned user.  
• Activity Logging: Automatically log user activities and actions during engagements.  
• Dark Mode: Toggle between light and dark themes for better readability.  
• Secret Management: Securely store and retrieve sensitive information like passwords and keys.  
  
## Installation  
  
### Prerequisites  
  
• Node.js (v14.x or later)  
• npm (v6.x or later)  
• sqlite  
  
### Steps  
1. Clone the Repository  
```
git clone https://github.com/adm1nPanda/OffChat
cd offchat
```  
  
2. Set Up the Server  
Navigate to the offchat-server directory and install the dependencies:  
```
cd offchat-server
npm install
```  
Create a .env file in the offchat-server directory and add your secret key and IV:  
```
SECRET_KEY=your_32_byte_hex_string_here
IV=your_16_byte_hex_string_here
```  
Start the server:  
```
npm start
```  
The server should now be running on http://localhost:5055  
  
3. Set Up the Client  
Open a new terminal and navigate to the offchat-client directory. Install the dependencies:  
```
cd ../offchat-client  
npm install --force
```  
Start the client:  
```
npm start
```  
The client should now be running on http://localhost:3000  
  
## Usage  
  
1.	Register: Create a new account using the registration form.  
2.	Login: Log in with your credentials.  
3.	Chat: Start secure conversations with team members.  
4.	Incidents: Log and track security incidents.  
5.	Activity Logs: View activity logs to see user actions and activities.  
6.	Toggle Theme: Switch between light and dark themes for better readability.  
7.	Manage Secrets: Securely store and retrieve sensitive information.  

## Contributing  
  
1.	Fork the repository.  
2.	Create a new branch (git checkout -b feature-branch).  
3.	Make your changes.  
4.	Commit your changes (git commit -am 'Add new feature').  
5.	Push to the branch (git push origin feature-branch).  
6.	Create a new Pull Request.  
  
## License  
  
This project is licensed under the MIT License.  
  
## Contact  
  
For any questions or suggestions, please contact dnc295@gmailcom.  