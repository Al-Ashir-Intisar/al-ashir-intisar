import time
import subprocess
import os
from datetime import datetime

# File paths
# credentials_file = r"C:\Users\iamin\OneDrive\Documents\Academic\Coursera\ShouldIGo Website Project\credentials.txt"

# Prompt the user for the credentials file path
credentials_file = input("Enter the full path to the credentials file: ").strip()

# Validate the file path
if not os.path.exists(credentials_file):
    print("The file path provided does not exist. Please check and try again.")
    exit(1)  # Exit the script if the file path is invalid

# Function to read credentials from the credentials.txt file
def read_credentials():
    credentials = {}
    with open(credentials_file, "r") as file:
        for line in file:
            key, value = line.split(":", 1)
            credentials[key.strip()] = value.strip()
    return credentials

# Function to wait until 6:00 AM
def wait_until_6am():
    print("Waiting until 6:00 AM...")
    target_time = "03:41:00"
    while True:
        current_time = datetime.now().strftime("%H:%M:%S")
        if current_time >= target_time:
            print("It's 6:00 AM. Proceeding with execution...")
            break
        time.sleep(1)  # Check every second

# Function to run the Python scripts with inputs from credentials
def run_python_scripts(credentials):
    print("Running Python scripts...")
    try:
        # Run get_email.py with inputs from credentials
        print("\nRunning the first script...")
        subprocess.run(
            ["python", "get_email.py"],
            input=f"{credentials['Gmail Address']}\n{credentials['Gmail App Password']}\n",
            text=True,
            check=True
        )

        # Run extract_menu.py with the OpenAI API key
        print("\nRunning the second script...")
        subprocess.run(
            ["python", "extract_menu.py"],
            input=f"{credentials['OpenAI API secret key']}\n",
            text=True,
            check=True
        )
        print("Scripts executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running scripts: {e}")
        exit(1)

# Function to perform Git operations
def git_operations():
    print("Starting Git operations...")
    try:
        # Stage changes
        subprocess.run(["git", "add", "."], check=True)
        print("Changes staged.")

        # Commit changes
        commit_message = "Automated commit at 6:00 AM"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        print("Changes committed.")

        # Pull latest changes
        subprocess.run(["git", "pull", "origin", "main"], check=True)  # Replace 'main' with your branch name
        print("Latest changes pulled.")

        # Push changes
        subprocess.run(["git", "push", "origin", "main"], check=True)  # Replace 'main' with your branch name
        print("Changes pushed to the repository.")

    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        exit(1)

# Main script
if __name__ == "__main__":
    credentials = read_credentials()  # Read credentials from the file
    wait_until_6am()                 # Wait until 6:00 AM
    run_python_scripts(credentials)  # Run the two Python scripts
    git_operations()                 # Perform Git operations
