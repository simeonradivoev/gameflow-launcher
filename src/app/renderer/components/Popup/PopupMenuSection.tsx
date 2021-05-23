import React from 'react';
import { TreeInfoSection } from '../../../common/Types';

interface PopupMenuSectionProps {
  selectedSection: string;
  section: TreeInfoSection;
  select: (sectionId: string) => void;
}

const PopupMenuSection: React.FC<PopupMenuSectionProps> = ({
  selectedSection,
  section,
  children,
  select,
}) => {
  return (
    <div>
      <div
        id={section.id}
        className={`menu-entry ${selectedSection === section.id && 'selected'}`}
        onClick={() => {
          select(section.id);
        }}
      >
        <div className="label">
          {section.icon} {section.name}
        </div>
      </div>
      {children && <div className="menu-group">{children}</div>}
    </div>
  );
};

export default PopupMenuSection;
