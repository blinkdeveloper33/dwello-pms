'use client';

import Iridescence from './Iridescence';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <Iridescence
        color={[0.7, 0.7, 0.7]}
        speed={0.6}
        amplitude={0.1}
        mouseReact={true}
        className="w-full h-full pointer-events-auto"
      />
    </div>
  );
}

