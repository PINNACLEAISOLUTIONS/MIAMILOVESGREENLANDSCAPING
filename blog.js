const blogPosts = [
    {
        id: "sustainable-landscaping-miami",
        title: "Sustainable Landscaping in Miami: The Ultimate Guide for 2026",
        date: "January 25, 2026",
        author: "Miami Loves Green Team",
        category: "Landscaping",
        tags: ["sustainable", "miami", "native plants"],
        excerpt: "Discover how to create a stunning, eco-friendly oasis in Miami using native plants, smart water conservation, and sustainable design practices.",
        image: "./landscape-design.webp",
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
        image: "./hardscaping.webp",
        contentFile: "blog/modern-hardscaping-miami.md"
    },
    {
        id: "low-maintenance-miami-tropical-plants",
        title: "Top 7 Low-Maintenance Tropical Plants for your Miami Backyard in 2026",
        date: "January 27, 2026",
        author: "Miami Loves Green Team",
        category: "Landscape Design",
        tags: ["low-maintenance", "tropical plants", "miami", "backyard"],
        excerpt: "Transform your Miami backyard into a lush getaway without the endless yard work. Discover the best low-maintenance tropical plants for 2026.",
        image: "./landscape-design.webp",
        contentFile: "blog/low-maintenance-miami-tropical-plants.md"
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

    // Show single post view
    listSection.style.display = 'none';
    container.style.display = 'block';
    window.scrollTo(0, 0);

    container.innerHTML = `<div class="loading-state" style="text-align: center; padding: 50px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-green);"></i>
        <p>Loading article content...</p>
    </div>`;

    try {
        // Try to find the file using both relative and absolute-style paths to satisfy GH Pages/Netlify
        const pathsToTry = [
            post.contentFile,
            `./${post.contentFile}`,
            `/${post.contentFile}`
        ];

        let response;
        let lastError;

        for (const path of pathsToTry) {
            try {
                // Add a cache-buster (?t=...) so we don't see an old cached 404 page
                response = await fetch(`${path}?t=${Date.now()}`);
                if (response.ok) break;
            } catch (e) {
                lastError = e;
            }
        }

        if (!response || !response.ok) {
            throw new Error(`Could not find the article file at: ${post.contentFile}. Please check that the 'blog' folder was uploaded correctly.`);
        }

        let text = await response.text();

        // 1. Remove YAML frontmatter
        text = text.replace(/---[\s\S]*?---/, '').trim();

        // 2. Convert markdown to HTML (Enhanced Parser)
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
            <div class="post-header reveal active">
                <a href="blog.html" class="back-to-blog"><i class="fas fa-chevron-left"></i> Back to Blog</a>
                <div class="post-meta">
                    <span class="category">${post.category}</span>
                    <span class="date">${post.date}</span>
                </div>
                <h1>${post.title}</h1>
                <div class="post-author">By ${post.author}</div>
            </div>
            <div class="post-featured-image reveal active" style="background-image: url('${post.image}');"></div>
            <div class="post-content-body reveal active">
                <p>${html}</p>
            </div>
            <div class="post-footer reveal active">
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                </div>
                <div class="share-post">
                    <span>Share:</span>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                </div>
                <div style="margin-top: 40px; text-align: center; padding: 40px; background: rgba(76, 175, 80, 0.05); border-radius: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">Ready to create your dream garden in Miami?</h3>
                    <a href="index.html#footer-contact" class="read-more" style="justify-content: center; font-size: 1.2rem; background: var(--primary-green); color: black; padding: 10px 25px; border-radius: 50px;">Get Your Free Estimate <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Critical Blog Error:", error);
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; background: rgba(255,0,0,0.05); border-radius: 20px; border: 1px solid rgba(255,0,0,0.2);">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ff5252; margin-bottom: 20px;"></i>
                <h2 style="color: #ff5252;">Content Loading Issue</h2>
                <p style="color: #ccc; margin-bottom: 20px;">The blog post data has loaded correctly, but the actual article file is not appearing at <code>${post.contentFile}</code>.</p>
                <p style="font-size: 0.9rem; color: #888;">If you just uploaded these files, it may take 1-2 minutes for the server to sync.</p>
                <a href="blog.html" class="back-to-blog" style="margin-top: 20px; display: inline-flex;">Back to Articles</a>
            </div>
        `;
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
