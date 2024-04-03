import * as yup from 'yup';

const validateUsername = (userName: string, t: any): string | null => {
    const userNameSchema = yup.string()
        .required(() => t('userNameRequired'))
        .min(3, t('usernameMinLength'))
        .max(20, t('usernameMaxLength'))
        .matches(/^(?=.*\d)[a-zA-Z0-9_]+$/, t('usernamePattern'));

    try {
        userNameSchema.validateSync(userName);
        return null; // Passes validation, no error message
    } catch (err: any) {
        return err.message; // Return the error message
    }
}

const validateEmail = (email: string, t: any): string | null => {
    const emailSchema = yup.string()
        .email(t('invalidEmail'))
        .required(t('emailRequired'));

    try {
        emailSchema.validateSync(email);
        return null; // Passes validation, no error
    } catch (err: any) {
        return err.message; // Return the error message
    }
}

const validatePassword = (password: string, t: any): string | null => {
    const passwordSchema = yup.string()
        .required(t('passwordRequired'))
        .min(8, t('passwordMinLength'))
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]+$/,
            t('passwordPattern'));

    try {
        passwordSchema.validateSync(password);
        return null; // Passes validation, no error
    } catch (err: any) {
        return err.message; // Return the error message
    }
}

const validateConfirmPassword = (confirmPassword: string, password: string, t: any): string | null => {
    const confirmPasswordSchema = yup.string()
        .required(t('confirmPasswordRequired'));

    if (confirmPassword !== password) {
        return t('confirmPasswordNotMatch');
    }

    try {
        confirmPasswordSchema.validateSync(confirmPassword);
        return null; // Passes validation, no error
    } catch (err: any) {
        return err.message; // Return the error message
    }
}


export { validateUsername, validateEmail, validatePassword, validateConfirmPassword };
