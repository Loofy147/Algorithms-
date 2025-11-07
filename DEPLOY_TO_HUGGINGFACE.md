# Deploying to Hugging Face Spaces

This guide provides step-by-step instructions on how to deploy this project and its examples to a [Hugging Face Space](https://huggingface.co/spaces).

Hugging Face Spaces is a great platform for hosting and sharing machine learning demos, but it can also be used to host general-purpose Docker containers, which is how we will deploy this project.

## Prerequisites

1.  A free [Hugging Face account](https://huggingface.co/join).
2.  [Git](https://git-scm.com/downloads) installed on your local machine.

## Deployment Steps

### 1. Create a New Hugging Face Space

*   Log in to your Hugging Face account.
*   Navigate to your profile and click on the **"Spaces"** tab.
*   Click the **"Create new Space"** button.
*   **Space name:** Choose a unique name for your Space (e.g., `my-advanced-algorithms`).
*   **License:** Select a license (e.g., `MIT`).
*   **Space SDK:** Select **Docker** as the SDK.
*   **Docker template:** Choose the **Blank** template.
*   **Space hardware:** The free `CPU basic` hardware is sufficient for this project.
*   Click **"Create Space"**.

### 2. Clone the Space Repository

Once the Space is created, you will be taken to its main page. You'll need to clone the Git repository for your new Space to your local machine.

```bash
# Replace <your-username> and <your-space-name> with your actual details
git clone https://huggingface.co/spaces/<your-username>/<your-space-name>
cd <your-space-name>
```

### 3. Add the Project Files

Now, you need to add all the files from this project (the `src`, `examples`, `package.json`, `Dockerfile`, etc.) into the repository you just cloned.

*   Copy all project files into the `<your-space-name>` directory.
*   The directory structure should look like this:

    ```
    <your-space-name>/
    ├── .git/
    ├── Dockerfile
    ├── examples/
    │   ├── time-aware-use-case.js
    │   └── ...
    ├── src/
    │   ├── time-aware/
    │   └── ...
    ├── package.json
    ├── package-lock.json
    └── README.md
    ```

### 4. Push to Hugging Face

Commit the new files and push them to the Hugging Face repository. This will trigger the build process on the Hugging Face servers.

```bash
# Add all the new files
git add .

# Commit the files
git commit -m "Initial project upload"

# Push to the main branch
git push
```

### 5. Running the Examples

The application will be built automatically. Because our `Dockerfile`'s default command is `bash`, the Space will not run a web server. Instead, it provides a terminal where you can execute the examples.

*   Go to your Space's page on Hugging Face.
*   Wait for the build to complete. The status will change to **"Running"**.
*   Click on the **"Logs"** tab to view the build process.
*   Once running, you won't see a running application. Instead, you can use the **Terminal** feature.
*   Click the **Terminal** tab.
*   You will be dropped into a `bash` shell inside your running container.

From the terminal, you can now run any of the use-case scripts:

```bash
# To run the time-aware computing example:
node examples/time-aware-use-case.js

# To run the resource-aware computing example:
node examples/resource-aware-use-case.js

# To run the algebraic composability example:
node examples/algebraic-composability-use-case.js
```

You have now successfully "deployed" the project to a Hugging Face Space, where you can demonstrate and interact with each computational principle via the terminal.
