import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firestoreAddUser } from '../services/apiService';
import { UserRole } from '../types';
import { Truck, LogIn, Loader2, AlertCircle, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
        // Se chegou aqui, o login foi sucesso.
        // O App.tsx deve detectar a mudança e desmontar este componente.
        
        // HACK PARA VERCEL: Se em 1.5 segundos o componente ainda estiver montado,
        // forçamos um reload da página para garantir que o App pegue o usuário.
        setTimeout(() => {
           console.log("Login: Forçando atualização de estado...");
           window.location.reload();
        }, 1500);

      } else {
        // --- CADASTRO ---
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`
        });

        // Determina cargo baseado no email (normalizado)
        const normalizedEmail = email.toLowerCase().trim();
        const role = normalizedEmail === 'cristianospaula1972@gmail.com' ? UserRole.ADMIN : UserRole.CONSULTANT;

        try {
          await firestoreAddUser({
            id: user.uid,
            name: name,
            email: normalizedEmail,
            role: role,
            avatar: user.photoURL || undefined
          });
        } catch (dbError) {
          console.error("Aviso criação perfil:", dbError);
        }
        
        // Também forçamos reload no cadastro se necessário
        setTimeout(() => {
           window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      let msg = isLogin ? "Falha ao fazer login." : "Falha ao criar conta.";
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Email ou senha incorretos.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "Este email já está cadastrado.";
      } else if (err.code === 'auth/weak-password') {
        msg = "A senha é muito fraca.";
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
      setLoading(false); // Só paramos o loading se der erro
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white shadow-lg">
            <Truck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SuperMix</h1>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Login do Sistema' : 'Criar Nova Conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
              {error.includes("já está cadastrado") && (
                <button 
                  onClick={() => setIsLogin(true)}
                  className="ml-auto text-xs font-bold underline hover:text-red-800"
                >
                  Fazer Login
                </button>
              )}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Seu Nome"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              <><LogIn size={20} className="mr-2" /> Entrar</>
            ) : (
              <><UserPlus size={20} className="mr-2" /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Crie agora' : 'Já tem conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};