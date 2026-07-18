import React from 'react';
import { User } from '../utils/seedData';
import { TrendingUp, UserCheck, Shield, Users } from 'lucide-react';

type LoginViewProps = {
  users: User[];
  onSelectUser: (user: User) => void;
};

export const LoginView: React.FC<LoginViewProps> = ({ users, onSelectUser }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-radial from-background via-muted/30 to-muted/80 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-4 animate-bounce">
          <TrendingUp className="w-9 h-9" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">FruitTrack</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8">
          Inventory, sales, and operations tracker. Select your profile to start your shift.
        </p>

        {/* User List */}
        <div className="w-full space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted active:scale-[0.98] transition-all border border-border rounded-2xl shadow-sm hover:shadow-md text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 text-primary" /> Admin
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 text-muted-foreground" /> Staff
                      </>
                    )}
                  </p>
                </div>
              </div>
              <UserCheck className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No users configured. Please refresh or contact your administrator.
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Contact the store administrator if you need a profile added.
        </p>
      </div>
    </div>
  );
};
