import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { version } from 'react';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3', 
  resources: {
    en: {
      translations: {
        signin: 'Sign In',
        signingIn: 'Signing In...',
        welcome: 'Welcome to Petty House!', 
        userName: 'Username',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        donnotHaveAccount: "Don't have an account? ",
        signupNow: 'Register now',
        loginError: 'Login failed',  
        invalidCredentials: 'Incorrect email or password. Please try again!',
        passwordInvalid:'Password must be at least 8 characters long',
        noInternet: 'No internet connection',
        close: 'Close',
        noAccountFound: 'The username you entered does not exist',
        email : 'Email',
        createAccount: 'Register your account now! ',
        register: 'Register',
        registering: 'Registering...',
        confirmPassword: 'Confirm Password',
        fullname: 'Full name',
        alreadyHaveAccount: 'Already have an account?',
        signinNow: 'Sign In now! ',
        registrationError: 'Registration failed', 
        registrationSuccess: 'Registration successful',
        registrationSuccessMessage: 'Welcome to Petty House! Your account has been successfully registered!', 
        userNameRequired: 'Username is required',
        usernameMinLength: 'Username must be at least 3 characters long',
        usernamePattern: 'Username must contain letters and numbers',
        usernameMaxLength: 'Username must be at most 30 characters long',
        fullNameRequired: 'Full name is required',
        fullNameMinLength: 'Full name must be at least 3 characters long',
        fullNameMaxLength: 'Full name must be at most 50 characters long',
        emailRequired: 'Email is required',
        invalidEmail: 'Invalid email format',
        passwordRequired: 'Password is required',
        confirmPasswordRequired: 'Confirm password is required',
        passwordMinLength: 'Password must be at least 8 characters long',
        passwordPattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        confirmPasswordNotMatch: 'Passwords mismatch',
        usernameAlreadyExists: 'The email you entered already exists. Please try again.',
        forgotPasswordTitle: 'Reset your password',
        forgotPasswordDescription: 'Enter the email address that is associated with your account to reset your password.',
        forgotPasswordButton: 'Continue',
        forgotPasswordButtonProcessing: 'Sending...',
        emailSentSuccess: 'Check your email',
        emailSentSuccessMessage: 'We have sent a password reset link to your email. Please check your inbox (and spam folder if you do not see it).',
        emailSentError: 'Error sending email',
        emailSentErrorMessage: 'An error occurred while sending the email. Please try again',
        searchPlaceholder: 'Search',
        locationPermissionTitle: 'Petty House needs Location Access',
        locationPermissionContent: 'To display your location and find post near you, we need access to your location. Your location wil not be saved or used for any other purpose.',
        locationPermissionButton: 'Continue',
        locationPermissionMessage: 'Location permission required',
        fetchingData: 'Searching...',
        explore: 'Explore',
        inbox: 'Inbox',
        create: 'Create',
        profile: 'Profile',
        settings: 'Settings',
        post: 'Post',
        goToPost: 'Go to post',
        lastestInYourArea: 'Lastest posts in your area',
        comment:'Comment',
        noRecords: 'to see latest posts',
        tapBottomSheetHeader: 'Tap',
        likes: 'likes',
        lesThanAnHourAgo: 'Less than an hour',
        justNow: 'Just now',
        minutesAgo: 'minutes',
        hoursAgo: 'hours',
        daysAgo: 'days',
        weeksAgo: 'weeks',
        weekAgo: 'week',
        monthAgo: 'months',
        cancelButton: 'Cancel',
        changeButton: 'Change',
        radiusSliderTitle: 'Change search radius',
        edit: 'Edit',
        hide: 'Hide',
        show: 'Show',
        delete: 'Delete',
        share: 'Share',
        report: 'Report',
        logout: 'Logout',
        settings: 'Settings',
        languageSwitch:'Language',
        version: 'Version 1.0.0 build 0424',
        reportTitle: 'What is wrong with this post?',
        offensiveReport: 'Offensive, hateful or sexual explicit',
        copyrightReport: 'Copyright or legal issues',
        privacyReport: 'Privacy concern',
        scamReport: 'Scam or fraudulent',
        spamReport: 'Spam or misleading',
        otherReport: 'Other',
        reasonReport: 'Please share your reason.',
        createPost: 'Create post',
        verifyAccount: 'Only verified accounts can post',
        verifiedUser: 'Verified user',
        unverifiedUser: 'Unverified user',
        noPost: 'There aren\'t any posts yet',
        noComment: 'There aren\'t any comments yet',
        writeComment: 'Write a comment',
        haventPosted: 'You haven\'t posted anything yet',
        startYourFirstPost: 'Start your first post',
        reportedPost: 'Post has been reported',
        currentLocation: 'Current location',
        writeSomething: 'What\'s on your mind?',
        chosenLocation: 'Chosen location',
        enterLocation: 'Enter location',
        save: 'Save',

      },
    },
    vi: {
      translations: {
        signin: 'Đăng nhập',
        signingIn: 'Đang đăng nhập...',
        welcome: 'Petty House Xin chào!',
        userName: 'Tên tài khoản',
        password: 'Mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        donnotHaveAccount: 'Bạn chưa có tài khoản?',
        signupNow: 'Đăng ký ngay',
        loginError: 'Đăng nhập không thành công', 
        invalidCredentials: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
        noInternet: 'Không có kết nối Internet',
        close: 'Đóng',
        noAccountFound: "Tên tài khoản này không tồn tại.",
        email : 'Email',
        createAccount: 'Đăng ký tài khoản ngay!',
        register: 'Đăng ký',
        registering: 'Đang đăng ký...',
        confirmPassword: 'Nhập lại mật khẩu',
        fullname: 'Họ và tên',
        alreadyHaveAccount: 'Đã có tài khoản?',
        signinNow: 'Đăng nhập ngay!',
        registrationError: 'Đăng ký không thành công', 
        registrationSuccess: 'Đăng ký thành công',
        registrationSuccessMessage: 'Chào bạn! Tài khoản của bạn đã được đăng ký thành công!',
        userNameRequired: 'Vui lòng nhập tên tài khoản',
        usernameMinLength: 'Tên tài khoản phải dài ít nhất 3 ký tự',
        usernamePattern: 'Tên tài khoản phải bao gồm chữ và số',
        usernameMaxLength: 'Tên tài khoản không được dài quá 30 ký tự',
        emailRequired: 'Vui lòng nhập email',
        invalidEmail: 'Định dạng email không hợp lệ',
        fullNameRequired: 'Vui lòng nhập họ và tên', 
        fullNameMinLength: 'Họ và tên phải dài ít nhất 3 ký tự',
        fullNameMaxLength: 'Họ và tên không được dài quá 50 ký tự',
        passwordRequired: 'Vui lòng nhập mật khẩu',
        confirmPasswordRequired: 'Vui lòng nhập lại mật khẩu', 
        passwordMinLength: 'Mật khẩu phải dài ít nhất 8 ký tự',
        passwordPattern: 'Mật khẩu phải chứa ít nhất một chữ cái hoa, một chữ cái thường, một số và một ký tự đặc biệt',
        confirmPasswordNotMatch: 'Mật khẩu không trùng khớp',   
        usernameAlreadyExists: 'Địa chỉ email đã được sử dụng. Vui lòng thử lại!',
        forgotPasswordTitle: 'Đặt lại mật \nkhẩu của bạn!',
        forgotPasswordDescription: 'Nhập email được liên kết với tài khoản của bạn để đặt lại mật khẩu.',
        forgotPasswordButton: 'Tiếp tục',
        forgotPasswordButtonProcessing: 'Đang gửi...',
        emailSentSuccess: 'Kiểm tra email của bạn',
        emailSentSuccessMessage: 'Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến (và thư mục spam nếu bạn không thấy)',
        emailSentError: 'Gửi mail không thành công',
        emailSentErrorMessage: 'Có lỗi xảy ra, vui lòng thử lại sau.',
        searchPlaceholder: 'Tìm kiếm',
        locationPermissionTitle: 'Yêu cầu truy cập vị trí',
        locationPermissionContent: 'Chúng tôi cần quyền truy cập vị trí để hiển thị vị trí của bạn và hiển thị các bài viết trong khu vực gần bạn. Dữ liệu vị trí của bạn sẽ không bị lưu trữ hoặc chia sẻ dưới mọi mục đích.',
        locationPermissionButton: 'Tiếp tục',
        locationPermissionMessage: 'Vui lòng cấp quyền truy cập vị trí.',
        fetchingData: 'Đang tìm kiếm...',
        explore: 'Khám phá',
        inbox: 'Hộp thư',
        create: 'Tạo mới',
        profile: 'Hồ sơ',
        settings: 'Cài đặt',
        goToPost: 'Đến bài viết',
        lastestInYourArea: 'Bài viết mới nhất trong khu vực',
        comment: 'Bình luận',
        noRecords: 'để tìm kiếm tin mới nhất',
        tapBottomSheetHeader: 'Nhấn',
        lesThanAnHourAgo: 'Ít hơn 1 giờ',
        justNow: 'Vừa xong',
        minutesAgo: 'phút',
        likes: 'lượt thích',
        hoursAgo: 'giờ',
        daysAgo: 'ngày',
        weeksAgo: 'tuần',
        weekAgo: 'tuần',
        monthAgo: 'tháng',
        cancelButton: 'Huỷ',
        changeButton: 'Thay đổi',
        radiusSliderTitle: 'Thay đổi phạm vi tìm kiếm',
        edit: 'Chỉnh sửa',
        hide: 'Ẩn bài',
        show: 'Hiện bài',
        delete: 'Xóa',
        share: 'Chia sẻ',
        report: 'Bảo cáo',
        logout: 'Đăng xuất',
        settings: 'Cài đặt',
        post: 'Đăng',
        languageSwitch:'Ngôn ngữ',
        version: 'Phiên bản 1.0.0 build 0424',
        reportTitle: 'Nội dung này có vấn đề gì?',
        offensiveReport: 'Mang tính xúc phạm, thù địch hoặc khiêu dâm',
        copyrightReport: 'Vi phạm bản quyền hoặc vấn đề pháp lý',
        privacyReport: 'Vấn đề về quyền riêng tư',
        scamReport: 'Lừa đảo hoặc gian lận',
        spamReport: 'Nội dung rác hoặc gây hiểu nhầm',
        otherReport: 'Khác',
        reasonReport: 'Vui lòng cho biết lý do của bạn.',
        createPost: 'Bài viết mới',
        verifyAccount: 'Chỉ tài khoản đã được xác thực mới được tạo bài viết!',
        verifiedUser: 'Tài khoản xác thực',
        unverifiedUser: 'Tài khoản chưa xác thực',
        noPost: 'Chưa có bài viết nào',
        noComment: 'Chưa có bình luận nào',
        writeComment: 'Viết một bình luận',
        haventPosted: 'Bạn chưa có bài viết nào',
        startYourFirstPost: 'Bắt đầu bài viết đầu tiên',
        reportedPost: 'Bài viết đã bị tố cáo',
        currentLocation: 'Vị trí hiện tại',
        writeSomething: 'Bạn đang nghĩ gì?',
        save: 'Lưu',
        chosenLocation: 'Vị trí tự chọn',
        enterLocation: 'Nhập địa chỉ mong muốn',
      },
    },
    // Add more languages as needed
  },
  fallbackLng: 'vi',
  debug: true,

  ns: ['translations'],
  defaultNS: 'translations',

  keySeparator: false,

  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
  },

  react: {
    wait: true,
  },

  initImmediate: false, // Prevent loading with your fallbackLn

});
// Load the language preference asynchronously from AsyncStorage
AsyncStorage.getItem('language').then((language) => {
  if (language) {
    i18n.changeLanguage(language);
  } else {
    i18n.changeLanguage('vi'); // Fallback to 'vn' if no preference is found
  }
}).catch((error) => {
  console.error('Error loading language preference:', error);
  i18n.changeLanguage('vi'); // Fallback to 'vn' in case of an error
});

export default i18n;
