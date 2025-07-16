import { ReactNode } from "react";
import { useTextSelection } from "use-text-selection";
import { createPortal } from "react-dom";
import { MdSearch } from 'react-icons/md';
// import { ReactComponent as AiIcon } from "assets/icons/aiSearchIconSvg.svg";
import { Button } from "antd";
const Portal = ({ children }: { children: ReactNode }) => {
  return createPortal(children, document.body);
};

const SelectionPopover = ({
  target,
  handleSearch,
}: {
  target?: HTMLElement;
  handleSearch: any;
}) => {
  const { isCollapsed, clientRect } = useTextSelection(target);
  //   console.log(isCollapsed, clientRect);

  if (clientRect == null || isCollapsed) return null;

  return (
    <Portal>
      <div
      onClick={handleSearch}
        style={{
          position: "absolute",
          left: `${100 + clientRect.left + clientRect.width / 2}px`,
          top: `${clientRect.top - 40}px`,
          marginLeft: "-75px",
          width: "50px",
          height: "35px",
          background: "white",
          fontSize: "0.7em",
        //   pointerEvents: "none",
          textAlign: "center",
          color: "white",
          borderRadius: "3px",
          cursor : "pointer",
          zIndex: 9999,
        }}
      >
        {/* Search */}
        <Button
          type="text"
          
          icon={
            <MdSearch
            // style={{height : "32px", width : "32px"}}
            />
          }
        />
      </div>
    </Portal>
  );
};

export default SelectionPopover;
