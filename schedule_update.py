import time
import subprocess
import os
from datetime import datetime

# Set the target time to 6:00 AM
target_time = "03:20:00"

# Function to wait until 6:00 AM
def wait_until_6am():
    print("Waiting until 6:00 AM...")
    while True:
        current_time = datetime.now().strftime("%H:%M:%S")
        if current_time >= target_time:
            print("It's 6:00 AM. Proceeding with execution...")
            break
        time.sleep(5)  # Check every second

# Function to run Python scripts
def run_python_scripts():
    print("Running Python scripts...")
    try:
        # Replace 'script1.py' and 'script2.py' with your actual filenames
        subprocess.run(["python", "get_email.py"], check=True)
        subprocess.run(["python", "extract_menu.py"], check=True)
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
    wait_until_6am()         # Wait until 6:00 AM
    run_python_scripts()     # Run the two Python scripts
    git_operations()         # Perform Git operations
