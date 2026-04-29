document.addEventListener('DOMContentLoaded', fetchBlogPost);

async function fetchBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    let postId = urlParams.get('id');
    
    // Fallback: If local server stripped the ?id= parameter, check localStorage
    if (!postId) {
        postId = localStorage.getItem('currentBlogId');
    }
    const blogContainer = document.getElementById('blog-container');

    if (!postId) {
        blogContainer.innerHTML = `
            <div class="text-center py-20">
                <h2 class="text-2xl font-bold text-white mb-4">Blog Post Not Found</h2>
                <a href="blogs.html" class="text-blue-400 hover:text-blue-300">Return to Blogs</a>
            </div>
        `;
        return;
    }

    try {
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;
        
        document.title = `${post.title} | RingTech Global`;

        const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        // Format content: convert double newlines to paragraphs
        // This makes the text entered in the admin dashboard look nicely spaced.
        const formattedContent = post.content
            .split('\n')
            .filter(p => p.trim() !== '')
            .map(p => `<p class="mb-6">${p}</p>`)
            .join('');

        blogContainer.innerHTML = `
            <div class="pt-4 mb-8">
                <a href="blogs.html" class="inline-flex items-center text-blue-400 hover:text-blue-300 font-bold transition-all group">
                    <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span>Back to Blogs</span>
                </a>
            </div>
            
            <div class="mb-10 text-center animate-fade-in-up">
                <span class="inline-block bg-blue-500/20 text-blue-400 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">${post.category || 'Uncategorized'}</span>
                <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">${post.title}</h1>
                <div class="flex items-center justify-center text-slate-400 text-sm font-medium space-x-6">
                    <span class="flex items-center"><svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ${dateStr}</span>
                    <span class="flex items-center"><svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${post.read_time || '5 Min Read'}</span>
                </div>
            </div>

            ${post.image_url ? `
            <div class="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-blue-900/20 border border-white/5 animate-fade-in-up" style="animation-delay: 0.1s;">
                <img src="${post.image_url}" alt="${post.title}" class="w-full h-full object-cover">
            </div>
            ` : ''}

            <div class="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed text-lg animate-fade-in-up" style="animation-delay: 0.2s;">
                ${formattedContent}
            </div>
        `;

    } catch (error) {
        console.error('Error fetching blog post:', error);
        blogContainer.innerHTML = `
            <div class="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
                <h2 class="text-2xl font-bold mb-4">Error loading article</h2>
                <p>${error.message}</p>
                <a href="blogs.html" class="inline-block mt-6 text-blue-400 hover:text-blue-300">Return to Blogs</a>
            </div>
        `;
    }
}
