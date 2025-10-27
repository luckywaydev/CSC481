// API client - ยังไม่ได้เชื่อมจริง
// TODO: ใช้ axios หรือ fetch เชื่อมกับ backend

export const api = {
  // Register
  register: async (data: any) => {
    console.log("Register:", data);
    // TODO: เชื่อมกับ backend
    return { success: false, message: "ยังไม่ได้เชื่อม backend" };
  },

  // Login
  login: async (data: any) => {
    console.log("Login:", data);
    // TODO: เชื่อมกับ backend
    return { success: false, message: "ยังไม่ได้เชื่อม backend" };
  },

  // Get current user
  getCurrentUser: async () => {
    // TODO: เชื่อมกับ backend
    return null;
  },
};
