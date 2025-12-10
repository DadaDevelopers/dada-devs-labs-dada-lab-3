# Contribution Guidelines

Please follow the guidelines below to ensure smooth collaboration and maintain high code quality across the team.

---

## Project Structure

The repository contains two main folders:

* **`frontend/`** – Used exclusively by the frontend team.
* **`backend/`** – Used exclusively by the backend team.

> **Note:** Only work inside your assigned folder unless you are actively collaborating with another team.

---

## Branching Workflow

We **do NOT** work directly on the `main` branch.

### Start from the Latest main branch (Rebase Workflow)

Always ensure your local `main` branch is up-to-date:

```bash
git checkout main
git fetch
git rebase origin/main
````

### Create a Feature Branch

Create a dedicated feature branch for every new task:

```bash
git checkout -b feature/<task-name>
```

**Branch Naming Convention:** Use clear and descriptive names, e.g.:

  * `add-login`
  * `feat/payment-state`
  * `feature/update-user-profile-ui`

### Push Your Branch

Write your code and push your branch to the remote:

```bash
git push -u origin feature/<task-name>
```

### Rebasing & Conflict Resolution

Always **rebase** your feature branch before creating or updating your Pull Request (PR). This keeps the commit history clean and linear.

**Fetch the Latest Changes:**

```bash
git fetch
```

**Rebase onto origin/main:**

```bash
git rebase origin/main
```

**Resolve Conflicts:** Resolve any conflicts that appear during the rebase. PRs with unresolved conflicts cannot be merged.

-----

## Pull Request (PR) Requirements

Open your PR into the **`dev`** branch when your feature is complete and rebased.

  * **Description:** A clear and concise description of the changes.
  * **Context:** Any relevant context needed for reviewers (e.g., related Jira tickets).
  * **Proof:** Screenshots or detailed test steps if applicable.

-----

## Commit Message Guidelines

Use descriptive, **conventional commit messages**.

**Format:** `<type>: <description>`

**Examples:**

  * `feat: implement donation payment flow`
  * `fix: correct validation error in checkout form`
  * `refactor: clean up wallet service logic`

**Avoid:** Vague messages like "update", "fixes", or "changes".

-----

## Testing & Code Quality

  * Test your changes locally before pushing.
  * Ensure no errors are introduced in your team’s assigned folder.
  * Follow any formatting or linting rules defined in the project.

-----

## Pull Request Review Process

Reviewers must:

  * Carefully read and understand the changes.
  * Pull the branch locally and test it before approving.
  * Confirm correct folder usage (`frontend/` or `backend/`).
  * Ensure the code follows project conventions and standards.
  * Request changes if something is unclear or incorrect.

> **Crucial:** Do not approve a PR unless you are confident in its correctness and quality.

-----

## Communication Expectations

  * Ask questions early if you are blocked.
  * Inform the team when your PR is ready or when you update it.
  * Tag specific reviewers when needed.

-----

## Environment & Dependencies

  * Use the project’s defined dependency versions.
  * Do not install or remove packages without documenting or discussing them.
  * If you add a new dependency, explain the rationale in your PR description.