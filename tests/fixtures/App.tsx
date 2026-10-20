import { useState } from 'react';
import { Plus } from 'lucide-react';
export default function App() {
  const [count, setCount] = useState(0);
  return <button className="p-7 text-emerald-700" onClick={() => setCount(count + 1)}><Plus />Count: {count}</button>;
}
