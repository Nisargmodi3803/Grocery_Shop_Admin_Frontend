import React, { useState, useMemo, use } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const UpdatePasswordAdmin = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(sessionStorage.getItem('username'));
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    if (password.length < 4) {
      return "Password is too short (min 4 characters)";
    } else if (password.length > 15) {
      return "Password is too long (max 15 characters)";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validatePassword(newPassword);
    if (errorMsg) {
      setPasswordError(errorMsg);
      return;
    } else if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    } else {
      setPasswordError('');
    }

    try {
      const response = await axios.patch(`http://localhost:9000/admin/change-password?userName=${userName}&oldPassword=${oldPassword}&newPassword=${newPassword}`);

      if (response.status === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Admin's Password has been registered successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      } else if (response.status === 401) {
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Old Password is incorrect.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Username does not exist!');
      }else if(error.response?.status === 401){
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Old Password is incorrect.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        console.error(error);
        alert('Something went wrong while Updating Password the admin.');
      }
    }
  };


  const disableSubmit = useMemo(() => {
    return (
      !!passwordError ||
      userName === '' ||
      oldPassword.trim() === '' ||
      newPassword.trim() === '' ||
      confirmPassword.trim() === '' ||
      userName.trim() === '' ||
      newPassword !== confirmPassword
    );
  }, [userName, passwordError, oldPassword, newPassword, confirmPassword, userName]);

  return (
    <div className='update-brand'>
      <Sidebar activeId={17} />
      <div className="update-brand-container">
        <h2>+ Change Admin Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Username <span className="required">*</span></label>
              <input
                type="text"
                value={userName}
                disabled
                style={{ backgroundColor: '#ddd',cursor: 'not-allowed' }}
                placeholder='Username'
                required
              />
            </div>

            <div className="form-group">
              <label>Old Password <span className="required">*</span></label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder='Old Password'
                required
              />
            </div>
            <div className="form-group">
              <label>New Password <span className="required">*</span></label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='New Password (4 to 15 characters)'
                required
              />
            </div>
            {passwordError && <p className="error">{passwordError}</p>}

            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm Password'
                required
              />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="error">Passwords do not match</p>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="update-btn"
                disabled={disableSubmit}
              >
                Update
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
