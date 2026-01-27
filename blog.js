const blogPosts = [
    {
        id: "sustainable-landscaping-miami",
        title: "Sustainable Landscaping in Miami: The Ultimate Guide for 2026",
        date: "January 25, 2026",
        author: "Miami Loves Green Team",
        category: "Landscaping",
        tags: ["sustainable", "miami", "native plants"],
        excerpt: "Discover how to create a stunning, eco-friendly oasis in Miami using native plants, smart water conservation, and sustainable design practices.",
        image: "./landscape-design.jpg",
        contentFile: "blog/sustainable-landscaping-miami.md"
    },
    {
        id: "modern-hardscaping-miami",
        title: "Modern Hardscaping Trends in Miami for 2026",
        date: "January 27, 2026",
        author: "Miami Loves Green Team",
        category: "Hardscaping",
        tags: ["hardscaping", "miami", "patios"],
        excerpt: "Explore the latest in luxury hardscaping: from permeable pavers to integrated outdoor kitchens that define the Miami lifestyle in 2026.",
        image: "./hardscaping.jpg",
        contentFile: "blog/modern-hardscaping-miami.md"
    }
];

function renderBlogList() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    grid.innerHTML = blogPosts.map(post => `
        <div class="blog-card reveal reveal-up">
            <div class="blog-image-area" style="background-image: url('${post.image}');">
                <div class="blog-category">${post.category}</div>
            </div>
            <div class="blog-content">
                <div class="blog-date"><i class="far fa-calendar-alt"></i> ${post.date}</div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-footer">
                    <a href="blog.html?id=${post.id}" class="read-more">Read Full Post <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    `).join('');
}

async function renderBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    const container = document.getElementById('post-container');
    const listSection = document.getElementById('blog-list-section');

    if (!post || !container) return;

    listSection.style.display = 'none';
    container.style.display = 'block';

    try {
        const response = await fetch(post.contentFile);
        let text = await response.text();

        // Simple Markdown-ish parser for demo
        // Remove frontmatter
        text = text.replace(/---[\s\S]*?---/, '');

        // Convert some markdown to HTML
        let html = text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\[(.*)\]\((.*)\)/gim, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n\* /g, '<ul><li>')
            .replace(/<\/li>\n/g, '</li>');

        container.innerHTML = `
            <div class="post-header">
                <a href="blog.html" class="back-to-blog"><i class="fas fa-chevron-left"></i> Back to Blog</a>
                <div class="post-meta">
                    <span class="category">${post.category}</span>
                    <span class="date">${post.date}</span>
                </div>
                <h1>${post.title}</h1>
                <div class="post-author">By ${post.author}</div>
            </div>
            <div class="post-featured-image" style="background-image: url('${post.image}');"></div>
            <div class="post-content-body">
                <p>${html}</p>
            </div>
            <div class="post-footer">
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                </div>
                <div class="share-post">
                    <span>Share:</span>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error loading blog post:", error);
        container.innerHTML = `<p>Error loading post. <a href="blog.html">Return to blog</a></p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        renderBlogPost(postId);
    } else {
        renderBlogList();
    }

    // Simple Reveal Animation logic
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
