/**
 * Demo 2: Type Errors → Blocked Execution
 * 
 * This file shows the "broken" change AI might propose
 * that gets caught by type checking before execution.
 */

// Original User type
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  // AI adds this field without updating all usages
  role: 'admin' | 'user' | 'guest'; // NEW FIELD - breaks existing code
}

// This function creates a user - now broken because 'role' is required
function createUser(email: string, name: string): User {
  return {
    id: generateId(),
    email,
    name,
    createdAt: new Date(),
    // ERROR: Missing required property 'role'
  };
}

// This function also broken - doesn't handle 'role'
function updateUser(user: User, updates: Partial<User>): User {
  return {
    ...user,
    ...updates,
    // Existing code doesn't know about 'role'
  };
}

// This serialization function also broken
function serializeUser(user: User): string {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    created: user.createdAt.toISOString(),
    // Missing: role
  });
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export { User, createUser, updateUser, serializeUser };
