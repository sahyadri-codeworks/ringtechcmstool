// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const editorModal = document.getElementById('editor-modal');
const editorPanel = document.getElementById('editor-panel');
const editorTitle = document.getElementById('editor-title');
const blogForm = document.getElementById('blog-form');
const saveBlogBtn = document.getElementById('save-blog-btn');
const adminBlogList = document.getElementById('admin-blog-list');

// Image upload preview
const imageDropArea = document.getElementById('image-drop-area');
const imageInput = document.getElementById('blog-image');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const imagePlaceholder = document.getElementById('image-placeholder');

let currentSession = null;
let currentImageFile = null;
let allBlogs = [];
let editingBlogId = null;
let existingImageUrl = '';

// Initialize Admin Panel
async function initAdmin() {
    // Check if SUPABASE_URL is set
    if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL_HERE') {
        alert('Supabase is not configured. Please open assets/js/supabase-config.js and add your URL and Anon Key.');
        return;
    }

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentSession = session;
        showDashboard();
        fetchAdminBlogs();
    } else {
        showLogin();
    }
}

// Authentication
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });
    
    if (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    } else {
        currentSession = data.session;
        showDashboard();
        fetchAdminBlogs();
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    currentSession = null;
    showLogin();
});

function showLogin() {
    loginOverlay.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginOverlay.classList.add('hidden');
    dashboard.classList.remove('hidden');
}

// Editor Modal Toggles
function toggleEditor(show, blogId = null) {
    if (show) {
        blogForm.reset();
        resetImagePreview();
        editingBlogId = blogId;
        existingImageUrl = '';
        
        if (blogId) {
            editorTitle.textContent = "Edit Blog";
            saveBlogBtn.textContent = "Save Changes";
            const blog = allBlogs.find(b => b.id === blogId);
            if (blog) {
                document.getElementById('blog-title').value = blog.title;
                document.getElementById('blog-category').value = blog.category;
                document.getElementById('blog-read-time').value = blog.read_time;
                document.getElementById('blog-content').value = blog.content;
                document.getElementById('blog-url').value = blog.url || '';
                if (blog.image_url) {
                    existingImageUrl = blog.image_url;
                    imagePreview.src = blog.image_url;
                    imagePlaceholder.classList.add('hidden');
                    imagePreviewContainer.classList.remove('hidden');
                }
            }
        } else {
            editorTitle.textContent = "Write a Blog";
            saveBlogBtn.textContent = "Publish Blog";
        }
        
        editorModal.classList.remove('hidden');
        // Small delay for the slide animation
        setTimeout(() => {
            editorPanel.classList.remove('translate-x-full');
        }, 10);
    } else {
        editorPanel.classList.add('translate-x-full');
        setTimeout(() => {
            editorModal.classList.add('hidden');
        }, 300);
    }
}

// Image Upload Handling
imageDropArea.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
    }
});

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePlaceholder.classList.add('hidden');
        imagePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function resetImagePreview() {
    currentImageFile = null;
    imagePreview.src = '';
    imagePlaceholder.classList.remove('hidden');
    imagePreviewContainer.classList.add('hidden');
    imageInput.value = '';
}

// Fetch and display blogs in admin
async function fetchAdminBlogs() {
    const { data: posts, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching blogs:', error);
        adminBlogList.innerHTML = `<div class="text-red-400 p-4 bg-red-500/10 rounded-xl">Error fetching blogs: ${error.message}</div>`;
        return;
    }

    allBlogs = posts;

    if (posts.length === 0) {
        adminBlogList.innerHTML = `
            <div class="text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl">
                <svg class="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 8H20"></path></svg>
                <h3 class="text-lg font-medium text-white mb-2">No blogs yet</h3>
                <p class="text-slate-400 text-sm mb-4">Create your first blog post to see it here.</p>
                <button onclick="toggleEditor(true)" class="text-blue-400 hover:text-blue-300 font-medium">Create Blog</button>
            </div>
        `;
        return;
    }

    adminBlogList.innerHTML = posts.map((post, index) => `
        <div class="blog-item p-6 rounded-2xl animate-fade-in flex flex-col sm:flex-row gap-6 items-start" style="animation-delay: ${index * 0.05}s">
            <div class="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-500 text-sm">No Image</div>`}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                    <span class="bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">${post.category || 'Uncategorized'}</span>
                    <span class="text-slate-500 text-xs font-medium">${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 truncate">${post.title}</h3>
                <p class="text-slate-400 text-sm line-clamp-2 mb-4">${post.content}</p>
                <div class="flex gap-3 mt-auto">
                    <button onclick="toggleEditor(true, '${post.id}')" class="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Edit</button>
                    <button onclick="deleteBlog('${post.id}')" class="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Create or Update blog
saveBlogBtn.addEventListener('click', async () => {
    const title = document.getElementById('blog-title').value;
    const category = document.getElementById('blog-category').value;
    const readTime = document.getElementById('blog-read-time').value;
    const content = document.getElementById('blog-content').value;
    const destUrl = document.getElementById('blog-url').value;

    if (!title || !content || !category) {
        alert('Please fill in Title, Category, and Content.');
        return;
    }

    saveBlogBtn.disabled = true;
    saveBlogBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...';

    try {
        let imageUrl = existingImageUrl;

        // Handle Image Upload
        if (currentImageFile) {
            const fileExt = currentImageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('blog-images')
                .upload(filePath, currentImageFile);

            if (uploadError) throw uploadError;

            const { data } = supabaseClient.storage.from('blog-images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }

        const postData = {
            title,
            category,
            read_time: readTime,
            content,
            url: destUrl || '#',
            image_url: imageUrl,
        };

        if (editingBlogId) {
            // Update Existing Post
            const { error: updateError } = await supabaseClient
                .from('posts')
                .update(postData)
                .eq('id', editingBlogId);

            if (updateError) throw updateError;
        } else {
            // Create New Post
            const { error: insertError } = await supabaseClient
                .from('posts')
                .insert([postData]);

            if (insertError) throw insertError;
        }

        toggleEditor(false);
        fetchAdminBlogs();

    } catch (error) {
        console.error('Error saving blog:', error);
        alert('Failed to save blog: ' + error.message);
    } finally {
        saveBlogBtn.disabled = false;
        saveBlogBtn.innerHTML = editingBlogId ? 'Save Changes' : 'Publish Blog';
    }
});

// Delete Blog
async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;

    try {
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        fetchAdminBlogs();
    } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog: ' + error.message);
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', initAdmin);
