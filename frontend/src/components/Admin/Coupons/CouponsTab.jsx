import { useState } from "react";
import CouponTable from "./CouponsTable";
import CouponModal from "./CouponsModal";

export default function CouponsTab() {
  const [isOpen, setIsOpen] = useState(false);

  const [coupons, setCoupons] = useState([]);

  return (
    <>
      <CouponTable coupons={coupons} />

      {isOpen && <CouponModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
