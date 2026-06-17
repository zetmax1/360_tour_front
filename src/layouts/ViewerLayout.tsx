import { Outlet } from 'react-router-dom';

export function ViewerLayout() {
  return (
    <div className="w-screen h-screen overflow-hidden overscroll-none touch-none relative bg-black">
      <Outlet />
    </div>
  );
}
