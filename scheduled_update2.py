import os
import subprocess
from datetime import datetime

def run_git_operations():
    """Perform Git operations using a GitHub PAT."""
    github_token = os.getenv("GITHUB_PAT")
    if not github_token:
        raise EnvironmentError("GitHub Personal Access Token (GITHUB_PAT) is not set.")

    repo_url = f"https://{github_token}@github.com/Al-Ashir-Intisar/al-ashir-intisar.git"

    try:
        subprocess.run(["git", "config", "user.email", "iamintisar45@gmail.com"], check=True)
        subprocess.run(["git", "config", "user.name", "Al Ashir Intisar"], check=True)
        subprocess.run(["git", "config", "pull.rebase", "false"], check=True)
        subprocess.run(["git", "config", "--global", "merge.ours.driver", "true"], check=True)  # Always use local changes

        # Update the remote URL
        subprocess.run(["git", "remote", "set-url", "origin", repo_url], check=True)

        # Add and commit changes
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Automated menu update"], check=True)

        # Pull remote changes, resolve conflicts with ours strategy
        subprocess.run(["git", "pull", "--strategy=ours", "origin", "main"], check=True)

        # Push changes to remote
        subprocess.run(["git", "push", "origin", "main"], check=True)

        print("Git operations completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        raise


def main():
    """Main function to handle the scheduled update process."""
    print("Scheduled update started at:", datetime.now())

    # Run get_email.py to fetch the latest email
    print("\nRunning get_email.py...")
    try:
        subprocess.run(
            ["python3", "get_email2.py"],
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Failed to run get_email.py: {e}")
        raise


    # Run extract_menu.py to process the email and generate the menu
    print("\nRunning extract_menu.py...")
    try:
        subprocess.run(
            ["python3", "extract_menu.py"],
            input=f"{os.getenv('OPENAI_API_KEY')}\n",
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Failed to run extract_menu.py: {e}")
        raise

    # Run Git operations to push updates to the GitHub repository
    print("\nStarting Git operations...")
    run_git_operations()

    print("Scheduled update completed at:", datetime.now())

if __name__ == "__main__":
    main()
