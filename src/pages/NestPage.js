/* src/pages/NestPage.css */

.nest-page {
    padding: 20px;
    background-color: var(--color-background);
}

.nest-header {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--color-border);
}

.nest-header h1 {
    font-size: 1.8em;
    color: var(--color-primary);
    margin-bottom: 10px;
}

.nest-actions {
    display: flex;
    gap: 10px;
}

.invite-btn {
    padding: 10px 15px;
    border: 1px solid var(--color-primary);
    border-radius: 6px;
    background-color: white;
    color: var(--color-primary);
    font-weight: 600;
}

.invite-btn.primary {
    background-color: var(--color-primary);
    color: white;
}

/* Liste des membres */
.member-list {
    margin-top: 30px;
}

.member-list h2 {
    font-size: 1.4em;
    margin-bottom: 15px;
    color: var(--color-text);
}

.member-card {
    display: flex;
    align-items: center;
    background-color: var(--color-card-bg);
    padding: 15px;
    border-radius: 8px;
    box-shadow: var(--color-shadow);
    margin-bottom: 10px;
    border-left: 5px solid transparent;
}

.member-card.is-me {
    border-left-color: var(--color-primary);
}

.member-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: var(--color-secondary);
    color: var(--color-text-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 1.2em;
    margin-right: 15px;
}

.member-info {
    flex-grow: 1;
}

.member-name {
    font-weight: 600;
    margin: 0;
}

.member-role {
    font-size: 0.85em;
    color: var(--color-text-light);
    margin: 0;
}
