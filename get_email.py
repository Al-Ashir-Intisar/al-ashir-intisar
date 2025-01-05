from imapclient import IMAPClient
import email
from email.header import decode_header
import getpass  # For secure password input

# Prompt for email and password
EMAIL = input("Enter your Gmail address: ")
PASSWORD = getpass.getpass("Enter your Gmail password or app password: ")

SERVER = 'imap.gmail.com'

# Connect to the server and login
with IMAPClient(SERVER) as client:
    client.login(EMAIL, PASSWORD)
    client.select_folder('INBOX')

    # Search for emails from the specific sender
    messages = client.search(['FROM', 'no-reply@cafebonappetit.com'])
    if messages:
        # Fetch the latest email (highest UID is the latest)
        latest_email_uid = max(messages)
        message_data = client.fetch(latest_email_uid, 'RFC822')[latest_email_uid]
        msg = email.message_from_bytes(message_data[b'RFC822'])

        # Decode and print the email subject
        subject, encoding = decode_header(msg['Subject'])[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding or 'utf-8')
        #print(f"Subject: {subject}")

        # Decode the email body
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode()
                    break
        else:
            body = msg.get_payload(decode=True).decode()
        #print(f"Body:\n{body}")

        # Write the subject and body to a text file
        with open("latest_email.txt", "w", encoding="utf-8") as file:
            file.write(f"Subject: {subject}\n")
            file.write(f"Body:\n{body}\n")

        #print("Email content written to latest_email.txt")
    else:
        print("No emails found from the specified sender.")
