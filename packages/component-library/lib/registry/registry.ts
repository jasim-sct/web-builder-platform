import React from 'react';

import type { SectionSchema } from '../schema/types';
import type { BaseSectionProps, SectionCategory, SectionInstance } from '../types';
import type { RenderSectionOptions, SectionMetadata, SectionRegistryItem } from './types';

class SectionRegistryStore {
  private registry = new Map<string, SectionRegistryItem<any>>();

  public register<P = Record<string, unknown>>(item: SectionRegistryItem<P>): void {
    if (this.registry.has(item.componentId)) {
      console.warn(
        `[SectionRegistry] Section with componentId '${item.componentId}' is already registered. Overwriting.`,
      );
    }
    this.registry.set(item.componentId, item);
  }

  public get<P = Record<string, unknown>>(componentId: string): SectionRegistryItem<P> | undefined {
    return this.registry.get(componentId) as SectionRegistryItem<P> | undefined;
  }

  public getSchema(componentId: string): SectionSchema | undefined {
    return this.registry.get(componentId)?.schema;
  }

  public getAll(): SectionRegistryItem<any>[] {
    return Array.from(this.registry.values());
  }

  public getByCategory(category: SectionCategory): SectionRegistryItem<any>[] {
    return Array.from(this.registry.values()).filter((item) => item.category === category);
  }

  public getMetadataList(): SectionMetadata[] {
    return Array.from(this.registry.values()).map(
      ({ id, name, displayName, category, description, version, preview, tags }) => ({
        id,
        name,
        displayName,
        category,
        description,
        version,
        preview: preview || undefined,
        tags,
      }),
    );
  }

  public render(
    instance: SectionInstance<any>,
    options?: RenderSectionOptions,
  ): React.ReactElement | null {
    const item = this.registry.get(instance.componentId);
    if (!item) {
      console.error(
        `[SectionRegistry] Cannot render unknown section componentId: '${instance.componentId}'`,
      );
      return null;
    }

    const Component = item.component;
    const componentProps: BaseSectionProps<any> = {
      id: instance.id,
      props: instance.props,
      style: instance.style,
      actions: instance.actions,
      className: options?.className,
      onAction: options?.onAction,
      isEditor: options?.isEditor,
    };

    return React.createElement(Component, {
      key: instance.id,
      ...componentProps,
    });
  }

  public clear(): void {
    this.registry.clear();
  }
}

export const sectionRegistry = new SectionRegistryStore();

export const registerSection = <P = Record<string, unknown>>(
  item: SectionRegistryItem<P>,
): void => {
  sectionRegistry.register(item);
};

export const getSection = <P = Record<string, unknown>>(
  componentId: string,
): SectionRegistryItem<P> | undefined => {
  return sectionRegistry.get<P>(componentId);
};

export const getSectionSchema = (componentId: string): SectionSchema | undefined => {
  return sectionRegistry.getSchema(componentId);
};

export const getAllSections = (): SectionRegistryItem<any>[] => {
  return sectionRegistry.getAll();
};

export const getSectionsByCategory = (category: SectionCategory): SectionRegistryItem<any>[] => {
  return sectionRegistry.getByCategory(category);
};

export const renderSectionInstance = (
  instance: SectionInstance<any>,
  options?: RenderSectionOptions,
): React.ReactElement | null => {
  return sectionRegistry.render(instance, options);
};
