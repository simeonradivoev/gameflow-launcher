import React from 'react';
import { TreeInfoSection, TreeNode } from '../../../common/Types';
import PopupMenuSection from './PopupMenuSection';

interface PopupMenuProps {
  sections: Array<TreeInfoSection>;
  selectedSection: TreeInfoSection;
  setSelectedSection: (section: TreeInfoSection) => void;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  sections,
  selectedSection,
  setSelectedSection,
}) => {
  const BuildTreeNode = (path: string, section: TreeInfoSection): TreeNode => {
    return {
      id: section.id,
      children: sections
        .filter((s) => s.id.startsWith(`${path}_`))
        .map((s) => BuildTreeNode(s.id, s)),
    };
  };

  const SectionsTree: Array<TreeNode> = sections
    .filter((s) => !s.id.includes('_'))
    .map((section) => BuildTreeNode(section.id, section));

  const selectSection = (sectionId: string) => {
    setSelectedSection(sections.find((s) => s.id === sectionId) ?? sections[0]);
  };

  const showSections = (
    children: Array<TreeNode>,
    select: (sectionId: string) => void
  ) =>
    children.map((treeNode) => (
      <PopupMenuSection
        key={treeNode.id}
        selectedSection={selectedSection.id}
        section={sections.find((s) => s.id === treeNode.id) ?? sections[0]}
        select={select}
      >
        {treeNode.children && showSections(treeNode.children, select)}
      </PopupMenuSection>
    ));

  return <>{showSections(SectionsTree, selectSection)}</>;
};

export default PopupMenu;
