  const handleLogin = async (email, password) => {
    try {
      const { authService } = await import('./services/authService');
      const response = await authService.login(email, password);
      
      setIsAuthenticated(true);
      setUser({
        name: response.user.name,
        email: response.user.email,
        profilePicture: '/default-avatar.png'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };
