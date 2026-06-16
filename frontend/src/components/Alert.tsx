import { ReactNode } from "react";
import {
  MdError,
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdClose,
} from "react-icons/md";
import "./AlertStyles.css";

interface AlertProps {
  message: string | ReactNode;
  type?: "error" | "success" | "warning" | "info";
  onClose: () => void;
}

const getIcon = (type: string) => {
  const iconProps = { size: 20 };

  switch (type) {
    case "error":
      return <MdError {...iconProps} />;
    case "success":
      return <MdCheckCircle {...iconProps} />;
    case "warning":
      return <MdWarning {...iconProps} />;
    case "info":
      return <MdInfo {...iconProps} />;
    default:
      return null;
  }
};

export default function Alert({
  message,
  type = "error",
  onClose,
}: AlertProps) {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">{getIcon(type)}</span>
        <span className="alert-message">{message}</span>
      </div>
      <button className="alert-close" onClick={onClose}>
        <MdClose size={16} />
      </button>
    </div>
  );
}
