export const getProtected = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/protected`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (res.status === 403) {
        alert("You’ve been logged out. Another device has logged in.");
        setToken(''); // clear local token
        return;
      }
  
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Network error", err);
    }
  };
  