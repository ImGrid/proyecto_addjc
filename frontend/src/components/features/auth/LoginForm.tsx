'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { loginAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KimonoIcon } from '@/components/ui/kimono-icon';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    const result = await loginAction(data);

    if (result && !result.success) {
      setError(result.error || 'Error al iniciar sesión');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setShowModal(false);
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {/* Background Image - Cubre toda la pantalla */}
      <Image
        src="/images/imagen03.jpg"
        alt="Judo belts background"
        fill
        priority
        className="object-cover"
        style={{ filter: 'brightness(0.7) contrast(1.1)' }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Contenedor centrado */}
      <div className="relative h-full w-full flex items-center justify-center p-4">
        {/* Login Card */}
        <Card className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[fadeInUp_0.5s_ease-out]">
          <CardHeader className="text-center p-8 pb-0">
            <div className="mx-auto mb-4 text-[3.5rem] animate-[bounce_2s_ease-in-out_infinite]">
              <KimonoIcon size={56} className="inline-block" />
            </div>
            <CardTitle className="text-[1.75rem] font-bold text-[#1a2a6c] mb-2">
              Iniciar Sesión
            </CardTitle>
            <p className="text-[0.875rem] text-[#64748b]">
              Sistema de Planificación de Entrenamiento - ADDJC
            </p>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="block font-semibold text-[#1e293b] text-[0.9rem]">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  {...register('email')}
                  disabled={isLoading}
                  className="w-full px-4 py-[0.875rem] border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)]"
                />
                {errors.email && (
                  <p className="text-sm text-danger mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Campo Password con toggle */}
              <div className="space-y-2">
                <Label htmlFor="password" className="block font-semibold text-[#1e293b] text-[0.9rem]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    {...register('password')}
                    disabled={isLoading}
                    className="w-full px-4 py-[0.875rem] pr-12 border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full w-12 bg-none border-none cursor-pointer flex items-center justify-center text-[#64748b] transition-colors duration-300 hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-danger mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Opciones: Recordarme y Olvidé contraseña */}
              <div className="flex justify-between items-center flex-wrap gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[0.875rem] text-[#475569]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-primary text-[0.875rem] font-semibold no-underline transition-colors duration-300 hover:text-primary-dark hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error del servidor */}
              {error && (
                <div className="p-[0.875rem] px-4 rounded-lg bg-[#fee2e2] border-l-4 border-[#ef4444] text-[0.875rem] font-medium text-[#991b1b]">
                  {error}
                </div>
              )}

              {/* Botón Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-[0.875rem] mt-2 bg-gradient-to-br from-primary to-primary-dark text-white border-none rounded-lg text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:from-primary-dark hover:to-[#c74e00] hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,0,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Link de registro */}
              <p className="text-center mt-4 text-[0.9rem] text-[#64748b]">
                ¿Eres nuevo?{' '}
                <Link
                  href="/registro"
                  className="text-[#1a2a6c] no-underline font-semibold hover:underline hover:text-primary"
                >
                  Regístrate aquí
                </Link>
              </p>
            </form>

            {/* Volver al inicio */}
            <p className="text-center mt-4 pt-4 border-t border-[#e2e8f0]">
              <Link
                href="/"
                className="text-[#64748b] no-underline text-[0.875rem] inline-flex items-center gap-2 transition-colors duration-300 hover:text-[#1a2a6c]"
              >
                <ArrowLeft size={16} />
                Volver al inicio
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de recuperación de contraseña */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out]">
            <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center">
              <h3 className="text-[1.25rem] font-bold text-[#1e293b]">Recuperar Contraseña</h3>
              <button
                onClick={() => setShowModal(false)}
                className="bg-none border-none text-[1.5rem] text-[#64748b] cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300 hover:bg-[#e2e8f0] hover:text-[#1e293b]"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#64748b] leading-[1.6] mb-5 text-[0.9rem]">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              <form onSubmit={handleForgotPassword}>
                <div className="mb-6">
                  <Label htmlFor="recoveryEmail" className="block mb-2 font-semibold text-[#1e293b] text-[0.9rem]">
                    Correo electrónico
                  </Label>
                  <Input
                    id="recoveryEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    required
                    className="w-full px-4 py-[0.875rem] border-2 border-[#e2e8f0] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)]"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 text-[0.9rem] bg-[#e2e8f0] text-[#1e293b] hover:bg-[#cbd5e1]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 text-[0.9rem] bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,0,0.4)]"
                  >
                    Enviar instrucciones
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
