document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-btn');
    const clearButton = document.getElementById('clear-btn');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const hashtagsInput = document.getElementById('hashtags');
    const logsContainer = document.getElementById('logs');
    const hashtagFilter = document.getElementById('hashtag-filter');

    saveButton.addEventListener('click', () => {
        const title = titleInput.value;
        const content = contentInput.value;
        const hashtags = hashtagsInput.value.split(',').map(tag => tag.trim());
        if (title && content) {
            const log = { title, content, hashtags, date: new Date().toISOString() };
            fetch('/save-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            }).then(response => response.text()).then(message => {
                alert(message);
                loadLogs();
                clearInputs();
            }).catch(error => alert('Failed to save log'));
        } else {
            alert('Title and content are required!');
        }
    });

    clearButton.addEventListener('click', clearInputs);
    function loadLogs() {
        fetch('/load-logs').then(response => response.json()).then(logs => {
            renderLogs(logs);
        }).catch(error => alert('Failed to load logs'));
    }

    function renderLogs(logs) {
        logsContainer.innerHTML = '';
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.classList.add('log');
            logElement.innerText = log.title;
            logElement.addEventListener('click', () => {
                fetch(`/load-log/${encodeURIComponent(log.title)}`).then(response => response.json()).then(log => {
                    titleInput.value = log.title;
                    contentInput.value = log.content;
                    hashtagsInput.value = log.hashtags.join(', ');
                }).catch(error => alert('Failed to load log'));
            });
            logsContainer.appendChild(logElement);
        });
    }

    function clearInputs() {
        titleInput.value = '';
        contentInput.value = '';
        hashtagsInput.value = '';
    }

    loadLogs();
});
