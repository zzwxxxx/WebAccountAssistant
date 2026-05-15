const contentEl = document.getElementById("install-content");

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderInline(text) {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let listType = "";
    let inCode = false;
    let codeLines = [];

    const closeList = () => {
        if (listType) {
            html.push(`</${listType}>`);
            listType = "";
        }
    };

    const openList = type => {
        if (listType !== type) {
            closeList();
            html.push(`<${type}>`);
            listType = type;
        }
    };

    for (const line of lines) {
        if (line.startsWith("```")) {
            if (inCode) {
                html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
                codeLines = [];
                inCode = false;
            } else {
                closeList();
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            codeLines.push(line);
            continue;
        }

        if (!line.trim()) {
            closeList();
            continue;
        }

        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
            closeList();
            const level = heading[1].length;
            html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
            continue;
        }

        const unordered = /^-\s+(.+)$/.exec(line);
        if (unordered) {
            openList("ul");
            html.push(`<li>${renderInline(unordered[1])}</li>`);
            continue;
        }

        const ordered = /^\d+\.\s+(.+)$/.exec(line);
        if (ordered) {
            openList("ol");
            html.push(`<li>${renderInline(ordered[1])}</li>`);
            continue;
        }

        const quote = /^>\s+(.+)$/.exec(line);
        if (quote) {
            closeList();
            html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
            continue;
        }

        closeList();
        html.push(`<p>${renderInline(line)}</p>`);
    }

    closeList();
    if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }
    return html.join("\n");
}

async function loadInstallGuide() {
    if (!contentEl) return;
    try {
        const response = await fetch(chrome.runtime.getURL("INSTALL.md"));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const markdown = await response.text();
        contentEl.innerHTML = renderMarkdown(markdown);
    } catch (error) {
        contentEl.textContent = `安装教程加载失败：${error.message}`;
    }
}

loadInstallGuide();
