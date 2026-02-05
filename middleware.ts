import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Se está na raiz, redireciona para dashboard
  if (pathname === '/') {
    // Verifica se há token no cookie ou header
  const token = request.cookies.get('token')?.value || 
      request.headers.get('authorization');
    
    if (token) {
      // Se autenticado, vai para dashboard
   return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Se não autenticado, vai para login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
