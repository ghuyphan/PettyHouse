import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        invalidCredentials: 'Incorrect password. Please try again!',
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
        registrationError: 'Error during registration', 
        registrationSuccess: 'Registration successful',
        registrationSuccessMessage: 'Welcome to Petty House! Your account has been successfully registered!', 
        userNameRequired: 'Username is required',
        usernameMinLength: 'Username must be at least 3 characters long',
        usernamePattern: 'Username must contain letters and numbers',
        usernameMaxLength: 'Username must be at most 30 characters long',
        fullNameRequired: 'Full name is required',
        emailRequired: 'Email is required',
        invalidEmail: 'Invalid email format',
        passwordRequired: 'Password is required',
        confirmPasswordRequired: 'Confirm password is required',
        passwordMinLength: 'Password must be at least 8 characters long',
        passwordPattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        confirmPasswordNotMatch: 'Passwords mismatch',
        usernameAlreadyExists: 'The email you entered already exists. Please try again',
        forgotPasswordTitle: 'Reset your password',
        forgotPasswordDescription: 'Enter the email address that is associated with your account to reset your password.',
        forgotPasswordButton: 'Continue',
        forgotPasswordButtonProcessing: 'Sending...',
        emailSentSuccess: 'Check your email',
        emailSentSuccessMessage: 'We have sent a password reset link to your email. Please check your inbox (and spam folder if you do not see it).',
        emailSentError: 'Error sending email',
        emailSentErrorMessage: 'An error occurred while sending the email. Please try again',
        searchPlaceholder: 'Search',
        locationPermissionTitle: 'Petty House needs access to your location',
        locationPermissionContent: 'Your location is used to show your location on the map and needed to find pets in your area.',
        locationPermissionButton: 'Continue',
        explore: 'Explore',
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
        invalidCredentials: 'Mật khẩu không chính xác. Vui lòng thử lại.',
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
        registrationError: 'Có lỗi xảy ra trong lúc đăng ký', 
        registrationSuccess: 'Đăng ký thành công',
        registrationSuccessMessage: 'Chào bạn! Tài khoản của bạn đã được đăng ký thành công!',
        userNameRequired: 'Vui lòng nhập tên tài khoản',
        usernameMinLength: 'Tên tài khoản phải dài ít nhất 3 ký tự',
        usernamePattern: 'Tên tài khoản phải bao gồm chữ và số',
        usernameMaxLength: 'Tên tài khoản không được dài quá 30 ký tự',
        emailRequired: 'Vui lòng nhập email',
        invalidEmail: 'Định dạng email không hợp lệ',
        fullNameRequired: 'Vui lòng nhập họ và tên', 
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
        locationPermissionTitle: 'Petty House cần quyền truy cập vào vị tri',
        locationPermissionContent: 'Vị trí của bạn được sử dụng để hiển thị vị trí của bạn trên bản đồ và cần thiết để tìm thú cưng trong khu vực của bạn.',
        locationPermissionButton: 'Tiếp tục',
        explore: 'Khám phá',
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
