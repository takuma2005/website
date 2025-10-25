// ================================
// Main JavaScript Functionality
// ================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // Loading Screen
    // ================================
    const loader = document.getElementById('loader');
    
    // Hide loader after page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 500);
    });
    
    // ================================
    // Header Scroll Effect
    // ================================
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolling down
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ================================
    // Mobile Menu Toggle
    // ================================
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // ================================
    // Smooth Scrolling
    // ================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ================================
    // Active Navigation Link
    // ================================
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
        const scrollPosition = window.pageYOffset + header.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();
    
    // ================================
    // Back to Top Button
    // ================================
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ================================
    // Voice Sample Categories Filter
    // ================================
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sampleItems = document.querySelectorAll('.sample-item');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter samples
            sampleItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'flex';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // ================================
    // Works Filter and Show More
    // ================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');
    const worksGrid = document.getElementById('worksGrid');
    const showMoreBtn = document.getElementById('showMoreWorks');
    const INITIAL_WORKS_COUNT = 6;
    let currentFilter = 'all';
    let showingAll = false;

    // Convert NodeList to Array and store original order
    const workItemsArray = Array.from(workItems);

    // Priority categories (higher number = higher priority)
    const categoryPriority = {
        'cm': 4,      // TV CM
        'tv': 3,      // TV Programs
        'vp': 2,      // Corporate VP
        'other': 1    // Others
    };

    // Function to sort works by category priority and preserve variety
    function sortWorksByPriority(items, filter) {
        if (filter === 'all') {
            // For 'all', create a balanced mix of categories
            const categorized = {
                'cm': [],
                'tv': [],
                'vp': [],
                'other': []
            };

            // Group by category
            items.forEach(item => {
                const category = item.dataset.category || 'other';
                if (categorized[category]) {
                    categorized[category].push(item);
                }
            });

            // Interleave categories for variety
            const sorted = [];
            const maxLength = Math.max(
                categorized.cm.length,
                categorized.tv.length,
                categorized.vp.length,
                categorized.other.length
            );

            for (let i = 0; i < maxLength; i++) {
                if (categorized.cm[i]) sorted.push(categorized.cm[i]);
                if (categorized.tv[i]) sorted.push(categorized.tv[i]);
                if (categorized.vp[i]) sorted.push(categorized.vp[i]);
                if (categorized.other[i]) sorted.push(categorized.other[i]);
            }

            return sorted;
        } else {
            // For specific category, return as-is (maintains original order)
            return items.filter(item => item.dataset.category === filter);
        }
    }

    // Function to update works display with improved algorithm
    function updateWorksDisplay() {
        // Get filtered items
        const filteredItems = currentFilter === 'all'
            ? workItemsArray
            : workItemsArray.filter(item => item.dataset.category === currentFilter);

        // Sort items
        const sortedItems = sortWorksByPriority(filteredItems, currentFilter);

        // Hide all items first with fade out
        workItemsArray.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
        });

        // Wait for fade out, then reorder and display
        setTimeout(() => {
            // Clear grid
            while (worksGrid.firstChild) {
                worksGrid.removeChild(worksGrid.firstChild);
            }

            // Re-append in sorted order
            sortedItems.forEach((item, index) => {
                worksGrid.appendChild(item);

                // Determine if item should be visible
                const shouldShow = showingAll || index < INITIAL_WORKS_COUNT;

                if (shouldShow) {
                    item.style.display = 'flex';
                    // Stagger animation for visual effect
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50 * (index % 6)); // Stagger by row
                } else {
                    item.style.display = 'none';
                }
            });

            // Update show more button
            updateShowMoreButton(sortedItems.length);
        }, 300);
    }

    // Function to update show more button state
    function updateShowMoreButton(totalCount) {
        if (!showMoreBtn) return;

        const hiddenCount = Math.max(0, totalCount - INITIAL_WORKS_COUNT);

        if (hiddenCount > 0 && !showingAll) {
            showMoreBtn.style.display = 'block';
            showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> もっと見る (${hiddenCount}件)`;
            showMoreBtn.disabled = false;
            showMoreBtn.style.opacity = '1';
        } else if (showingAll && totalCount > INITIAL_WORKS_COUNT) {
            showMoreBtn.style.display = 'block';
            showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> 閉じる';
            showMoreBtn.disabled = false;
            showMoreBtn.style.opacity = '1';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }
    
    // Initial display
    updateWorksDisplay();
    
    // Filter button click
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            showingAll = false;
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update display
            updateWorksDisplay();
        });
    });
    
    // Show more button click
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            showingAll = !showingAll;
            updateWorksDisplay();
            
            // Scroll to the first hidden item if expanding
            if (showingAll && workItems.length > INITIAL_WORKS_COUNT) {
                setTimeout(() => {
                    const firstHiddenItem = workItems[INITIAL_WORKS_COUNT];
                    if (firstHiddenItem) {
                        const rect = firstHiddenItem.getBoundingClientRect();
                        const offset = window.pageYOffset + rect.top - 100;
                        window.scrollTo({
                            top: offset,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            }
        });
    }
    
    // ================================
    // Intersection Observer for Animations
    // ================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.section-header, .work-item, .sample-item, .profile-content, .contact-content');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
    
    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // ================================
    // Parallax Effect for Hero
    // ================================
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }
    
    // ================================
    // Typing Effect for Hero Title
    // ================================
    const heroTitle = document.querySelector('.hero-title');
    
    if (heroTitle) {
        // Add typing animation on load
        setTimeout(() => {
            heroTitle.classList.add('typed');
        }, 1000);
    }
    
    // ================================
    // Sound Wave Animation
    // ================================
    const soundWaveElements = document.querySelectorAll('.sound-wave span');
    
    soundWaveElements.forEach((span, index) => {
        span.style.animationDelay = `${index * 0.1}s`;
    });
    
    // ================================
    // Preload Images
    // ================================
    const imagesToPreload = [
        'assets/images/profile.jpg',
        'assets/images/work-placeholder.jpg'
    ];
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // ================================
    // Handle Form Validation Feedback
    // ================================
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                if (this.value.trim() === '') {
                    this.style.borderColor = '#f44336';
                } else {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--color-accent)';
        });
    });
    
    // ================================
    // Utility Functions
    // ================================
    
    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for resize events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Recalculate positions after resize
            updateActiveNavLink();
        }, 250);
    });
    
    // ================================
    // Performance Optimization
    // ================================
    
    // Lazy load images when they come into view
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
    
    // ================================
    // Console Easter Egg
    // ================================
    console.log('%c🎙️ ようこそ！', 'font-size: 24px; font-weight: bold; color: #F3A838;');
    console.log('%cこのサイトはモダンなWeb技術で構築されています。', 'font-size: 14px; color: #666;');
    console.log('%c開発者の方へ: お仕事のご依頼はお問い合わせフォームからどうぞ！', 'font-size: 12px; color: #999;');
});

// ================================
// Page Visibility API
// ================================
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.title = '🎙️ お待ちしています | ナレーターポートフォリオ';
    } else {
        // Resume animations when page is visible
        document.title = 'ナレーター | ボイスサンプル & ポートフォリオ';
    }
});

// ================================
// Prevent Right Click on Images (Optional)
// ================================
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

// ================================
// Service Worker Registration (for PWA - optional)
// ================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}