import auth from '@react-native-firebase/auth';

/**
 * Request an OTP for a given phone number.
 * @param {string} phoneNumber - The 10-digit mobile number with country code (+91).
 * @returns {Promise<FirebaseActionResult>}
 */
export const requestOTP = async (phoneNumber) => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return { success: true, confirmation };
  } catch (error) {
    console.error('[Firebase Auth] OTP Request Error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code // Include the Firebase error code
    };
  }
};

/**
 * Verify the OTP code.
 * @param {object} confirmation - The confirmation object from requestOTP.
 * @param {string} code - The 6-digit code entered by the user.
 * @returns {Promise<FirebaseActionResult>}
 */
export const verifyOTP = async (confirmation, code) => {
  try {
    const result = await confirmation.confirm(code);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('[Firebase Auth] OTP Verification Error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code // Include the Firebase error code
    };
  }
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
