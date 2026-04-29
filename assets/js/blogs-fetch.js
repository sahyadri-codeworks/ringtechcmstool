document.addEventListener('DOMContentLoaded', fetchPublicBlogs);

async function fetchPublicBlogs() {
    const blogGrid = document.getElementById('blog-grid');
    
    // Check if config exists
    if (typeof supabaseClient === 'undefined' || SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL_HERE') {
        blogGrid.innerHTML = `
            <div class="col-span-full text-center text-red-400 py-12 bg-red-500/10 rounded-2xl border border-red-500/20">
                Supabase configuration is missing. Please configure assets/js/supabase-config.js
            </div>
        `;
        return;
    }

    try {
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (posts.length === 0) {
            blogGrid.innerHTML = `
                <div class="col-span-full text-center text-slate-400 py-12">
                    No blogs found. Check back later!
                </div>
            `;
            return;
        }

        // Map colors for categories (like the original design)
        const categoryColors = {
            'Cyber Security': 'teal',
            'Web Development': 'blue',
            'Marketing': 'green',
        };

        blogGrid.innerHTML = posts.map((post, index) => {
            // Determine color class, fallback to blue
            const baseColor = categoryColors[post.category] || 'blue';
            const colorClass = `bg-${baseColor}-500/90`; // e.g., bg-teal-500/90, bg-blue-600/90
            
            // Format date
            const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            });

            return `
                <a href="blog-post.html?id=${post.id}" onclick="localStorage.setItem('currentBlogId', '${post.id}')" class="blog-card rounded-2xl overflow-hidden animate-fade-in-up block" style="animation-delay: ${index * 0.1}s;">
                    <div class="relative h-56 w-full overflow-hidden bg-slate-800">
                        ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="absolute inset-0 w-full h-full object-cover">` : ''}
                        <div class="absolute top-4 left-4 ${colorClass} backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">${post.category || 'Uncategorized'}</div>
                    </div>
                    <div class="p-8">
                        <div class="flex items-center text-slate-400 text-xs font-medium mb-4 space-x-4">
                            <span class="flex items-center"><svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ${dateStr}</span>
                            <span class="flex items-center"><svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${post.read_time || '5 Min Read'}</span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-4 leading-snug group-hover:text-blue-400 transition-colors duration-300">${post.title}</h3>
                        <p class="text-slate-400 text-sm leading-relaxed mb-6 border-b border-white/10 pb-6">
                            ${post.content}
                        </p>
                        <div class="flex items-center justify-between">
                            <span class="text-blue-400 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">Read Article <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching blogs:', error);
        blogGrid.innerHTML = `
            <div class="col-span-full text-center text-red-400 py-12 bg-red-500/10 rounded-2xl border border-red-500/20">
                Failed to load blogs. ${error.message}
            </div>
        `;
    }
}
