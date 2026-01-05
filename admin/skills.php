<?php
/**
 * Super Admin - Skills Management
 */
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/auth.php';

requireRole(ROLE_SUPER_ADMIN);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $name = escape($_POST['name'] ?? '');
        $category = escape($_POST['category'] ?? '');
        $icon = escape($_POST['icon'] ?? 'fas fa-code');
        $description = escape($_POST['description'] ?? '');
        
        if (!empty($name)) {
            $sql = "INSERT INTO skills (name, category, icon, description) VALUES ('$name', '$category', '$icon', '$description')";
            if (query($sql)) {
                setFlash('success', 'Skill added successfully.');
            }
        }
    }
    
    if ($action === 'delete') {
        $skillId = (int)($_POST['skill_id'] ?? 0);
        // Check if skill is in use
        $result = query("SELECT COUNT(*) as count FROM assessments WHERE skill_id = $skillId");
        $count = fetch($result)['count'];
        if ($count > 0) {
            setFlash('danger', 'Cannot delete skill - it is being used in assessments.');
        } else {
            query("DELETE FROM skills WHERE id = $skillId");
            setFlash('success', 'Skill deleted.');
        }
    }
    
    redirect('skills.php');
}

// Get skills
$result = query("SELECT s.*, 
                 (SELECT COUNT(*) FROM assessments WHERE skill_id = s.id) as assessment_count,
                 (SELECT COUNT(*) FROM user_skills WHERE skill_id = s.id) as user_count
                 FROM skills s
                 ORDER BY s.category, s.name");
$skills = fetchAll($result);

$pageTitle = 'Skills Management';
$currentPage = 'skills';

require_once __DIR__ . '/includes/admin-header.php';
?>

<!-- Stats -->
<div class="row mb-4">
    <div class="col-12 col-md-4 mb-3">
        <div class="stat-card gradient-teal">
            <div class="stat-icon">
                <i class="fas fa-brain"></i>
            </div>
            <div class="stat-details">
                <h3><?= count($skills) ?></h3>
                <p>Total Skills</p>
            </div>
        </div>
    </div>
</div>

<?php if ($flash = getFlash()): ?>
    <div class="alert alert-<?= $flash['type'] ?>" style="margin-bottom: 1.5rem; padding: 1rem; border-radius: 8px; background: <?= $flash['type'] === 'success' ? '#dcfce7' : '#fee2e2' ?>; color: <?= $flash['type'] === 'success' ? '#166534' : '#991b1b' ?>;">
        <?= $flash['message'] ?>
    </div>
<?php endif; ?>

<div class="card">
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title"><i class="fas fa-brain"></i> All Skills</h3>
        <button class="btn btn-primary" onclick="document.getElementById('addModal').style.display='block'">
            <i class="fas fa-plus"></i> Add Skill
        </button>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Skill</th>
                        <th>Category</th>
                        <th>Assessments</th>
                        <th>Users</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($skills as $skill): ?>
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="<?= htmlspecialchars($skill['icon'] ?: 'fas fa-code') ?>"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600;"><?= htmlspecialchars($skill['name']) ?></div>
                                                    <small class="text-muted"><?= htmlspecialchars($skill['category'] ?: 'General') ?></small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge badge-secondary"><?= htmlspecialchars($skill['category'] ?: 'General') ?></span>
                            </td>
                            <td><?= $skill['assessment_count'] ?></td>
                            <td><?= $skill['user_count'] ?></td>
                            <td>
                                <div class="btn-group">
                                    <?php if ($skill['assessment_count'] == 0): ?>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this skill?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="skill_id" value="<?= $skill['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-danger">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </form>
                                    <?php else: ?>
                                        <span class="badge badge-info">In use</span>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add Skill Modal -->
<div id="addModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.25rem;">Add New Skill</h3>
            <button onclick="document.getElementById('addModal').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
        </div>
        <form method="POST">
            <input type="hidden" name="action" value="add">
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Skill Name *</label>
                    <input type="text" name="name" required placeholder="e.g., React.js" style="width: 100%; padding: 0.625rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Category</label>
                    <select name="category" style="width: 100%; padding: 0.625rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <option value="">General</option>
                        <option value="Programming">Programming</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Database">Database</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Soft Skills">Soft Skills</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Icon Class</label>
                    <input type="text" name="icon" value="fas fa-code" placeholder="Font Awesome class" style="width: 100%; padding: 0.625rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <small style="color: #64748b;">Use Font Awesome icon classes (e.g., fab fa-python)</small>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                    <textarea name="description" rows="2" placeholder="Brief description" style="width: 100%; padding: 0.625rem; border: 1px solid #e5e7eb; border-radius: 8px;"></textarea>
                </div>
            </div>
            <div style="padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('addModal').style.display='none'">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Skill
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    // Modal display with flex
    const modal = document.getElementById('addModal');
    const openButtons = document.querySelectorAll('[onclick*="addModal"]');
    
    openButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    });
</script>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
