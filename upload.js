// Import thư viện simple-git
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

// Cấu hình Git
const repoURL = 'https://github.com/zdeptrai/bomberman-game.git';
const git = simpleGit();

// Tên tệp HTML chúng ta muốn tải lên
const htmlFileName = 'index.html';
const htmlFilePath = path.join(__dirname, htmlFileName);

async function runUpload() {
    try {
        console.log('--- Bắt đầu quy trình tải lên Git ---');

        // Kiểm tra xem tệp HTML có tồn tại không
        if (!fs.existsSync(htmlFilePath)) {
            console.error(`Lỗi: Không tìm thấy tệp "${htmlFileName}" trong thư mục này. Vui lòng đặt tên tệp HTML thành "index.html".`);
            return;
        }

        // Khởi tạo repo Git cục bộ nếu chưa có
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.log('Khởi tạo kho lưu trữ Git cục bộ...');
            await git.init();
            await git.addRemote('origin', repoURL);
        }

        // Lấy các thay đổi mới nhất từ repo
        console.log('Lấy các thay đổi mới nhất từ GitHub...');
        try {
            await git.pull('origin', 'main');
        } catch (pullError) {
            console.warn('Cảnh báo: Không thể pull từ remote (có thể là lần đầu tiên hoặc nhánh "main" chưa có). Tiếp tục...');
        }
        
        // Tạo nhánh 'main' và chuyển sang nhánh đó
        console.log('Đảm bảo nhánh "main" tồn tại và hoạt động...');
        await git.checkout('main').catch(async () => {
            // Nếu nhánh 'main' chưa tồn tại, tạo mới
            await git.checkoutLocalBranch('main');
        });

        // Thêm tất cả tệp vào staging area
        console.log('Thêm tất cả tệp vào Git...');
        await git.add('.');

        // Commit các thay đổi
        console.log('Tạo commit...');
        const status = await git.status();
        if (status.files.length > 0) {
             await git.commit('Cập nhật trò chơi Đặt Bom');
        } else {
            console.log('Không có thay đổi nào để commit.');
        }

        // Đẩy các thay đổi lên kho lưu trữ GitHub
        console.log('Đẩy các thay đổi lên nhánh "main" trên GitHub...');
        await git.push('origin', 'main');

        console.log('--- Hoàn tất! Tải tệp lên GitHub thành công. ---');
    } catch (err) {
        console.error('Đã xảy ra lỗi trong quá trình tải lên:', err);
    }
}

runUpload();
