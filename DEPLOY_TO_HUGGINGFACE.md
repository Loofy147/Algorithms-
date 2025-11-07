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

### 2. Configure Environment Variables (Optional)

This project is configured via environment variables (see `src/config.js`). You can override the default parameters in your Hugging Face Space.

*   On your Space's page, go to the **"Settings"** tab.
*   Click on **"Repository secrets"** in the left sidebar.
*   Click **"New secret"**. You can add secrets that will be available as environment variables during runtime.

For example, to change the exploration rate of the `SelfOptimizingCache`:

*   **Name:** `CACHE_EPSILON`
*   **Value:** `0.25`

This will override the default value of `0.1`. You can do this for any variable listed in the `config.js` file.

### 3. Clone the Space Repository and Add Files

Clone the Git repository for your new Space to your local machine, and then copy all the project files into it.

```bash
# Replace <your-username> and <your-space-name> with your actual details
git clone https://huggingface.co/spaces/<your-username>/<your-space-name>
cd <your-space-name>

# Now, copy all the project files (src, examples, package.json, etc.) into this directory.
```

### 4. Push to Hugging Face

Commit the new files and push them to the Hugging Face repository. This will trigger the build process on the Hugging Face servers.

```bash
git add .
git commit -m "Initial project upload"
git push
```

### 5. Running the Examples

The application will be built automatically. Because our `Dockerfile`'s default command is `bash`, the Space provides an interactive terminal rather than a web server.

*   Go to your Space's page on Hugging Face and wait for the status to change to **"Running"**.
*   Click the **"Terminal"** tab.

From the terminal, you can now run any of the use-case scripts. The scripts will automatically use any environment variables you configured.

```bash
# Run the self-modifying algorithm example to see your new configuration in action:
node examples/self-modifying-use-case.js

# Run any other example:
node examples/time-aware-use-case.js
```

You have now successfully "deployed" the project to a Hugging Face Space, where you can demonstrate and interact with each computational principle via the terminal.
