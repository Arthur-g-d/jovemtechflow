
import { Input } from "@/components/ui/input";

interface EmailSectionProps {
  email: string;
  setEmail: (email: string) => void;
}

const EmailSection = ({ email, setEmail }: EmailSectionProps) => (
  <div>
    <label className="block mb-1 font-medium">Email</label>
    <Input
      type="email"
      value={email}
      required
      onChange={e => setEmail(e.target.value)}
    />
  </div>
);

export default EmailSection;
