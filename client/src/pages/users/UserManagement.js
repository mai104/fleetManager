import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user: currentUser, updateUserPermissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle permission change
  const handlePermissionChange = async (userId, permission, value) => {
    try {
      const userToUpdate = users.find(u => u._id === userId);
      
      if (!userToUpdate) {
        toast.error('User not found');
        return;
      }
      
      // Update permissions
      const updatedPermissions = {
        ...userToUpdate.permissions,
        [permission]: value
      };
      
      // Call API to update permissions
      const success = await updateUserPermissions(userId, updatedPermissions);
      
      if (success) {
        // Update local state
        setUsers(users.map(u => {
          if (u._id === userId) {
            return {
              ...u,
              permissions: updatedPermissions
            };
          }
          return u;
        }));
        
        toast.success('Permissions updated successfully');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    // Cannot delete yourself
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      try {
        await axios.delete(`/api/users/${userId}`);
        
        // Update local state
        setUsers(users.filter(u => u._id !== userId));
        
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };
  
  if (loading) {
    return <div className="loading">Loading users...</div>;
  }
  
  return (
    <div className="user-management-container">
      <h1 className="page-title">User Management</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>Manage Users and Permissions</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Manage user permissions for the fleet management system. There is a maximum limit of 5 users.
            Currently, there are {users.length} users registered.
          </p>
          
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>View</th>
                    <th>Edit</th>
                    <th>Export</th>
                    <th>Manage Users</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.permissions.canView}
                          onChange={(e) => handlePermissionChange(user._id, 'canView', e.target.checked)}
                          disabled={user.role === 'admin'} // Admin has all permissions by default
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.permissions.canEdit}
                          onChange={(e) => handlePermissionChange(user._id, 'canEdit', e.target.checked)}
                          disabled={user.role === 'admin'} // Admin has all permissions by default
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.permissions.canExport}
                          onChange={(e) => handlePermissionChange(user._id, 'canExport', e.target.checked)}
                          disabled={user.role === 'admin'} // Admin has all permissions by default
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.permissions.canManageUsers}
                          onChange={(e) => handlePermissionChange(user._id, 'canManageUsers', e.target.checked)}
                          disabled={user.role === 'admin'} // Admin has all permissions by default
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="btn btn-sm btn-danger"
                          disabled={user.role === 'admin' || user._id === currentUser.id} // Cannot delete admin or current user
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {users.length < 5 && (
            <div className="mt-3">
              <p>You can invite more users to join the system (up to the limit of 5 users).</p>
              <p>New users can register at the registration page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
