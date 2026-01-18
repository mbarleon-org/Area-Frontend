import { forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { EditMenuProps, EditMenuHandle } from './EditMenu.types';
import { useEditMenuLogic } from './useEditMenuLogic';
import { EditMenuTabs } from './EditMenuTabs';
import { EditMenuField } from './EditMenuField';
import { GmailConnection } from './GmailConnection';
import { CustomFieldsList } from './CustomFieldsList';
import { styles } from './EditMenu.styles';

const EditMenu = forwardRef<EditMenuHandle, EditMenuProps>(
  ({ node, updateNode, onClose, onDelete, credentials, refreshCredentials }, ref) => {
    const logic = useEditMenuLogic({ node, updateNode, onClose, credentials, refreshCredentials });

    useImperativeHandle(ref, () => ({ requestClose: logic.handleRequestClose }), [
      logic.handleRequestClose,
    ]);

    if (!node) return null;

    const handleDelete = () => {
      Alert.alert(
        'Delete Node',
        'Are you sure you want to delete this node?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete?.();
              onClose();
            },
          },
        ]
      );
    };

    return (
      <Modal
        visible={logic.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={logic.handleRequestClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.overlay}>
            <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Edit Node</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logic.handleRequestClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TABS */}
            <EditMenuTabs
              activeTab={logic.activeTab}
              setActiveTab={logic.setActiveTab}
              hasInputs={logic.hasInputs}
              hasOutputs={logic.hasOutputs}
              hasOptions={logic.hasOptions}
            />

            {/* TAB CONTENT */}
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              {/* --- GENERAL TAB --- */}
              {logic.activeTab === 'general' && (
                <View style={styles.section}>
                  <EditMenuField
                    label="Name"
                    value={logic.name}
                    onChange={logic.setName}
                    placeholder="Node name..."
                    inputRef={logic.nameRef}
                  />

                  {/* Gmail Connection - Only for Gmail modules */}
                  {logic.isGmailModule && (
                    <GmailConnection
                      connectedAccountLabel={logic.connectedAccountLabel}
                      availableCredentials={logic.availableCredentials}
                      selectedCredentialId={logic.selectedCredentialId}
                      authEmail={logic.authEmail}
                      authPassword={logic.authPassword}
                      isConnecting={logic.isConnecting}
                      onSelectCredential={logic.setSelectedCredentialId}
                      onEmailChange={logic.setAuthEmail}
                      onPasswordChange={logic.setAuthPassword}
                      onConnect={logic.handleConnect}
                    />
                  )}

                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Type:</Text>
                    <Text style={styles.infoValue}>
                      {logic.specs.isAction
                        ? 'Action'
                        : logic.specs.isTrigger
                        ? 'Trigger'
                        : 'Unknown'}
                    </Text>
                  </View>
                </View>
              )}

              {/* --- INPUTS TAB --- */}
              {logic.activeTab === 'inputs' && logic.hasInputs && (
                <View style={styles.section}>
                  <CustomFieldsList
                    fields={logic.inputs}
                    specs={logic.specs.inputs}
                    newKey={logic.newInputKey}
                    onNewKeyChange={logic.setNewInputKey}
                    onFieldChange={logic.updateInput}
                    onFieldRemove={logic.removeInput}
                    onFieldAdd={logic.addInput}
                    placeholder="New input key..."
                    helpText="Dynamic Inputs & Variables"
                    isGmailModule={logic.isGmailModule}
                  />
                </View>
              )}

              {/* --- OUTPUTS TAB --- */}
              {logic.activeTab === 'outputs' && logic.hasOutputs && (
                <View style={styles.section}>
                  <CustomFieldsList
                    fields={logic.outputs}
                    specs={logic.specs.outputs}
                    newKey={logic.newOutputKey}
                    onNewKeyChange={logic.setNewOutputKey}
                    onFieldChange={logic.updateOutput}
                    onFieldRemove={logic.removeOutput}
                    onFieldAdd={logic.addOutput}
                    placeholder="New output key..."
                    helpText="Custom Outputs"
                    isGmailModule={logic.isGmailModule}
                  />
                </View>
              )}

              {/* --- OPTIONS TAB --- */}
              {logic.activeTab === 'options' && logic.hasOptions && (
                <View style={styles.section}>
                  {logic.specs.options.map((spec) => (
                    <View key={spec.id} style={styles.optionContainer}>
                      <Text style={styles.label}>{spec.pretty_name}</Text>
                      <TextInput
                        style={styles.input}
                        value={logic.options[spec.id] || ''}
                        onChangeText={(text) => logic.updateOption(spec.id, text)}
                        placeholder={`Enter ${spec.pretty_name}`}
                        placeholderTextColor="#666"
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

export default EditMenu;
