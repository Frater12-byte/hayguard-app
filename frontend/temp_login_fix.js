  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Import apiService at the top of the file
      const { apiService } = await import('../../services/apiService');
      
      // Call the real backend login API
      const response = await apiService.login(credentials.email, credentials.password);
      
      // Store the real JWT token
      localStorage.setItem('token', response.token);
      
      // Call onLogin with success
      const result = await onLogin(credentials.email, credentials.password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed: ' + (err.message || 'Please try again'));
    } finally {
      setIsLoading(false);
    }
  };
