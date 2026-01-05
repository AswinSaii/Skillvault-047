    </main>
    
    <!-- Footer -->
    <footer class="bg-gray border-top mt-4">
        <div class="container">
            <div class="row p-4">
                <div class="col-12 col-md-4 mb-3">
                    <div class="d-flex align-center gap-1 mb-2">
                        <i class="fas fa-shield-halved text-primary"></i>
                        <strong><?= APP_NAME ?></strong>
                    </div>
                    <p class="text-muted mb-0" style="font-size: 0.875rem;">
                        Skill Assessment & Certification Platform for Colleges
                    </p>
                </div>
                <div class="col-6 col-md-2 mb-3">
                    <h6 class="mb-2">Platform</h6>
                    <ul style="list-style: none; font-size: 0.875rem;">
                        <li class="mb-1"><a href="<?= APP_URL ?>/about.php" class="text-muted">About Us</a></li>
                        <li class="mb-1"><a href="<?= APP_URL ?>/features.php" class="text-muted">Features</a></li>
                        <li class="mb-1"><a href="<?= APP_URL ?>/pricing.php" class="text-muted">Pricing</a></li>
                    </ul>
                </div>
                <div class="col-6 col-md-2 mb-3">
                    <h6 class="mb-2">Support</h6>
                    <ul style="list-style: none; font-size: 0.875rem;">
                        <li class="mb-1"><a href="<?= APP_URL ?>/help.php" class="text-muted">Help Center</a></li>
                        <li class="mb-1"><a href="<?= APP_URL ?>/contact.php" class="text-muted">Contact</a></li>
                        <li class="mb-1"><a href="<?= APP_URL ?>/faq.php" class="text-muted">FAQ</a></li>
                    </ul>
                </div>
                <div class="col-6 col-md-2 mb-3">
                    <h6 class="mb-2">Legal</h6>
                    <ul style="list-style: none; font-size: 0.875rem;">
                        <li class="mb-1"><a href="<?= APP_URL ?>/privacy.php" class="text-muted">Privacy</a></li>
                        <li class="mb-1"><a href="<?= APP_URL ?>/terms.php" class="text-muted">Terms</a></li>
                    </ul>
                </div>
                <div class="col-6 col-md-2 mb-3">
                    <h6 class="mb-2">Connect</h6>
                    <div class="d-flex gap-1">
                        <a href="#" class="text-muted"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-github"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-top p-3 text-center">
                <small class="text-muted">
                    &copy; <?= date('Y') ?> <?= APP_NAME ?>. All rights reserved.
                </small>
            </div>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="<?= APP_URL ?>/assets/js/main.js"></script>
    
    <?php if (isset($additionalJS)): ?>
        <?php foreach ($additionalJS as $js): ?>
            <script src="<?= APP_URL ?>/assets/js/<?= $js ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
</body>
</html>
