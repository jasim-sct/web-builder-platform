import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { WSDndSpacerControl } from '../src/components/PropertyPanel/controls/WSDndSpacerControl';
import {
  Badge,
  Box,
  BoxModelControl,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  ConfirmDialog,
  ContextPill,
  Divider,
  EmptyState,
  Flex,
  FormField,
  Heading,
  IconButton,
  Modal,
  NumberInput,
  SearchInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  ToastContainer,
  ToastProvider,
  useToast,
} from '../src/design-system';

describe('Design System Primitives & Patterns', () => {
  describe('Typography', () => {
    it('renders Headings with correct tag and classes', () => {
      render(
        <>
          <Heading level={1}>Title 1</Heading>
          <Heading level={2}>Title 2</Heading>
        </>,
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title 1');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title 2');
    });

    it('renders Text and Badges', () => {
      render(
        <>
          <Text variant="primary" size="md">
            Hello World
          </Text>
          <Badge variant="success">Active</Badge>
        </>,
      );
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('Active')).toHaveClass('ds-badge--success');
    });
  });

  describe('Buttons', () => {
    it('renders Button with variants, sizes, icons and handles clicks', () => {
      const handleClick = vi.fn();
      render(
        <Button
          variant="primary"
          size="md"
          icon={<Sparkles data-testid="icon" />}
          onClick={handleClick}
        >
          Click Me
        </Button>,
      );

      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toHaveClass('ds-btn--primary');
      expect(screen.getByTestId('icon')).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders IconButton and ButtonGroup', () => {
      const handleIconClick = vi.fn();
      render(
        <ButtonGroup>
          <IconButton icon={<Sparkles />} title="Sparkle Action" onClick={handleIconClick} />
        </ButtonGroup>,
      );

      const iconBtn = screen.getByTitle('Sparkle Action');
      fireEvent.click(iconBtn);
      expect(handleIconClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Inputs and Form Controls', () => {
    it('renders TextInput and handles changes', () => {
      const handleChange = vi.fn();
      render(
        <TextInput
          placeholder="Enter name"
          value=""
          onChange={(e) => handleChange(e.target.value)}
        />,
      );

      const input = screen.getByPlaceholderText('Enter name');
      fireEvent.change(input, { target: { value: 'New Name' } });
      expect(handleChange).toHaveBeenCalledWith('New Name');
    });

    it('renders NumberInput and handles increment/decrement', () => {
      const handleChange = vi.fn();
      render(<NumberInput value={5} onChange={handleChange} min={0} max={10} step={1} />);

      const incBtn = screen.getByTitle('Increment');
      fireEvent.click(incBtn);
      expect(handleChange).toHaveBeenCalledWith(6);

      const decBtn = screen.getByTitle('Decrement');
      fireEvent.click(decBtn);
      expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('renders SearchInput with clear action', () => {
      const handleClear = vi.fn();
      render(
        <SearchInput
          placeholder="Search..."
          value="query"
          onClear={handleClear}
          onChange={() => {}}
        />,
      );

      const clearBtn = screen.getByTitle('Clear search');
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('renders Select dropdown', () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value="opt1"
          onChange={handleChange}
        />,
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders Switch and Checkbox toggles', () => {
      const handleSwitch = vi.fn();
      const handleCheckbox = vi.fn();

      render(
        <>
          <Switch checked={false} onChange={handleSwitch} label="Dark Mode" />
          <Checkbox checked={true} onChange={handleCheckbox} label="Agree" />
        </>,
      );

      fireEvent.click(screen.getByText('Dark Mode'));
      expect(handleSwitch).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByText('Agree'));
      expect(handleCheckbox).toHaveBeenCalledWith(false);
    });

    it('renders SegmentedControl and switches active item', () => {
      const handleSegment = vi.fn();
      render(
        <SegmentedControl
          value="tab1"
          onChange={handleSegment}
          items={[
            { value: 'tab1', label: 'Tab 1' },
            { value: 'tab2', label: 'Tab 2' },
          ]}
        />,
      );

      fireEvent.click(screen.getByText('Tab 2'));
      expect(handleSegment).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Tabs', () => {
    it('renders accessible Tabs and switches tab', () => {
      const handleTabChange = vi.fn();
      render(
        <Tabs
          activeTab="props"
          onChange={handleTabChange}
          tabs={[
            { id: 'props', label: 'Props' },
            { id: 'style', label: 'Style' },
          ]}
        />,
      );

      fireEvent.click(screen.getByText('Style'));
      expect(handleTabChange).toHaveBeenCalledWith('style');
    });
  });

  describe('Cards and Layouts', () => {
    it('renders Card with Header and Body', () => {
      render(
        <Card isInteractive>
          <CardHeader>Header Content</CardHeader>
          <CardBody>Body Content</CardBody>
        </Card>,
      );

      expect(screen.getByText('Header Content')).toBeInTheDocument();
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('renders Layout primitives: Box, Flex, Stack, Divider', () => {
      render(
        <Box>
          <Flex direction="row" gap={10}>
            <span>Flex Item</span>
          </Flex>
          <Stack gap={12}>
            <span>Stack Item</span>
          </Stack>
          <Divider vertical />
        </Box>,
      );

      expect(screen.getByText('Flex Item')).toBeInTheDocument();
      expect(screen.getByText('Stack Item')).toBeInTheDocument();
    });
  });

  describe('Modal & ConfirmDialog', () => {
    it('renders Modal and closes on close button and Escape key', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          Modal Inner Content
        </Modal>,
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Inner Content')).toBeInTheDocument();

      fireEvent.click(screen.getByTitle('Close dialog'));
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);

      rerender(
        <Modal isOpen={false} onClose={handleClose} title="Test Modal">
          Modal Inner Content
        </Modal>,
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders ConfirmDialog and triggers onConfirm and onCancel', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Section"
          message="Are you sure you want to delete this section?"
          confirmLabel="Delete"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
      );

      expect(screen.getByText('Delete Section')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this section?')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Delete'));
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Cancel'));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormField & ContextPill', () => {
    it('renders FormField with label, required asterisk, and description', () => {
      render(
        <FormField label="Full Name" required description="Enter your first and last name">
          <input type="text" />
        </FormField>,
      );

      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Enter your first and last name')).toBeInTheDocument();
    });

    it('renders ContextPill with deselect button', () => {
      const handleDeselect = vi.fn();
      render(<ContextPill label="Editing:" name="Hero Section" onDeselect={handleDeselect} />);

      expect(screen.getByText('Editing:')).toBeInTheDocument();
      expect(screen.getByText('Hero Section')).toBeInTheDocument();

      fireEvent.click(screen.getByTitle('Deselect Section'));
      expect(handleDeselect).toHaveBeenCalledTimes(1);
    });
  });

  describe('EmptyState & Toast', () => {
    it('renders EmptyState with title, description, and action button', () => {
      render(
        <EmptyState
          title="No Items"
          description="You have no items in your list."
          actions={<Button>Create Item</Button>}
        />,
      );

      expect(screen.getByText('No Items')).toBeInTheDocument();
      expect(screen.getByText('You have no items in your list.')).toBeInTheDocument();
      expect(screen.getByText('Create Item')).toBeInTheDocument();
    });

    it('provides global toast notification via ToastProvider', () => {
      const TestConsumer = () => {
        const { addToast } = useToast();
        return (
          <button
            type="button"
            onClick={() =>
              addToast({
                title: 'Operation Successful',
                message: 'Data saved successfully.',
                type: 'success',
              })
            }
          >
            Trigger Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <ToastContainer />
          <TestConsumer />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Trigger Toast'));
      expect(screen.getByText('Operation Successful')).toBeInTheDocument();
      expect(screen.getByText('Data saved successfully.')).toBeInTheDocument();
    });
  });

  describe('BoxModelControl & Spacer Pattern', () => {
    it('renders visual nested diagram with Margin, Padding, and Content and handles input changes', () => {
      const handleMarginChange = vi.fn();
      const handlePaddingChange = vi.fn();

      render(
        <BoxModelControl
          variant="visual"
          margin={{ top: '20px', right: '10px', bottom: '20px', left: '10px' }}
          padding={{ top: '40px', right: '16px', bottom: '40px', left: '16px' }}
          onMarginChange={handleMarginChange}
          onPaddingChange={handlePaddingChange}
        />,
      );

      expect(screen.getByText('Margin')).toBeInTheDocument();
      expect(screen.getByText('Padding')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();

      const marginTopInput = screen.getByLabelText('Margin Top');
      expect(marginTopInput).toHaveValue('20px');
      fireEvent.change(marginTopInput, { target: { value: '30px' } });
      expect(handleMarginChange).toHaveBeenCalledWith('top', '30px');

      const paddingTopInput = screen.getByLabelText('Padding Top');
      expect(paddingTopInput).toHaveValue('40px');
      fireEvent.change(paddingTopInput, { target: { value: '60px' } });
      expect(handlePaddingChange).toHaveBeenCalledWith('top', '60px');
    });

    it('renders grid variant with Top, Right, Bottom, Left text inputs', () => {
      const handleChange = vi.fn();

      render(
        <BoxModelControl
          variant="grid"
          values={{ top: '10px', right: '20px', bottom: '30px', left: '40px' }}
          onChange={handleChange}
        />,
      );

      expect(screen.getByText('Top')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
      expect(screen.getByText('Bottom')).toBeInTheDocument();
      expect(screen.getByText('Left')).toBeInTheDocument();

      const inputs = screen.getAllByPlaceholderText('0px');
      expect(inputs[0]).toHaveValue('10px');
      fireEvent.change(inputs[0], { target: { value: '15px' } });
      expect(handleChange).toHaveBeenCalledWith({
        top: '15px',
        right: '20px',
        bottom: '30px',
        left: '40px',
      });
    });

    it('renders WSDndSpacerControl and updates section style props', () => {
      const handleStyleChange = vi.fn();

      render(
        <WSDndSpacerControl
          style={{
            marginTop: '24px',
            marginBottom: '24px',
            paddingTop: '80px',
            paddingBottom: '80px',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
          onChange={handleStyleChange}
        />,
      );

      expect(screen.getByText('Box Model Spacing')).toBeInTheDocument();
      expect(screen.getByText('Margin')).toBeInTheDocument();
      expect(screen.getByText('Padding')).toBeInTheDocument();

      const marginTop = screen.getByLabelText('Margin Top');
      expect(marginTop).toHaveValue('24px');
      fireEvent.change(marginTop, { target: { value: '32px' } });
      expect(handleStyleChange).toHaveBeenCalledWith({ marginTop: '32px' });

      const paddingLeft = screen.getByLabelText('Padding Left');
      expect(paddingLeft).toHaveValue('32px');
      fireEvent.change(paddingLeft, { target: { value: '48px' } });
      expect(handleStyleChange).toHaveBeenCalledWith({ paddingLeft: '48px' });
    });
  });
});
