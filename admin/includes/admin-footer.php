        </div>
    </div>
    
    <!-- Overlay for mobile -->
    <div class="admin-overlay" id="adminOverlay"></div>
    
    <!-- Scripts -->
    <script>
        // Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.getElementById('adminOverlay');
        const body = document.body;
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                body.classList.toggle('sidebar-collapsed');
                localStorage.setItem('sidebarCollapsed', body.classList.contains('sidebar-collapsed'));
            });
        }
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                body.classList.toggle('sidebar-mobile-open');
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                body.classList.remove('sidebar-mobile-open');
            });
        }
        
        // Restore sidebar state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            body.classList.add('sidebar-collapsed');
        }
        
        // Auto-hide alerts
        document.querySelectorAll('.alert').forEach(alert => {
            const dismissTime = alert.dataset.dismiss;
            if (dismissTime) {
                setTimeout(() => {
                    alert.style.opacity = '0';
                    setTimeout(() => alert.remove(), 300);
                }, parseInt(dismissTime));
            }
        });
        
        // Close alerts manually
        document.querySelectorAll('.alert-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const alert = btn.closest('.alert');
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            });
        });
    </script>
</body>
</html>
