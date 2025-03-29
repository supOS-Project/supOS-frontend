/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-03-06 13:13:33
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-10 09:54:53
 * @Description:
 */
import assignUser from './AssignUser';
import candidateUsers from './CandidateUsers';

const LOW_PRIORITY = 500;

const customGroups = (element: any) => {
  return {
    CamundaPlatform__UserAssignment: {
      assignee: assignUser(element),
      candidateUsers: candidateUsers(element),
    },
  };
};

/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
function CustomPropertiesProvider(this: any, propertiesPanel: any) {
  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function (element: any) {
    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function (groups: any[]) {
      console.log(groups);

      const customGroupsData = customGroups(element);

      groups.forEach((group: { id: string; entries: any[] }) => {
        const groupData = customGroupsData[group.id as keyof typeof customGroupsData];
        if (!groupData) return;
        group.entries.forEach((entry: { id: string; component: any }) => {
          const entryData = groupData[entry.id as keyof typeof groupData];
          if (!entryData) return;
          entry.component = entryData.component;
        });
      });

      return groups;
    };
  };

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'translate'];

export default CustomPropertiesProvider;
