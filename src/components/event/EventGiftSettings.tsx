"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, PlusIcon, TrashIcon } from "lucide-react";
import {
  BankAccountDraft,
  emptyBankAccountDraft,
  SRI_LANKAN_BANKS,
} from "@/lib/gifts";

type EventGiftSettingsProps = {
  enabled: boolean;
  accounts: BankAccountDraft[];
  onEnabledChange: (enabled: boolean) => void;
  onAccountsChange: (accounts: BankAccountDraft[]) => void;
};

export function EventGiftSettings({
  enabled,
  accounts,
  onEnabledChange,
  onAccountsChange,
}: EventGiftSettingsProps) {
  const updateAccount = (clientId: string, patch: Partial<BankAccountDraft>) => {
    onAccountsChange(
      accounts.map((account) =>
        account.clientId === clientId ? { ...account, ...patch } : account,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
        <div className="space-y-0.5 pr-4">
          <Label htmlFor="gifts_enabled" className="text-base font-medium text-gray-900 cursor-pointer">
            Enable cash gifts
          </Label>
          <p className="text-sm text-gray-500">
            Guests on the invite list can send a bank transfer, a message, and a payment slip. Off by default.
          </p>
        </div>
        <Switch
          id="gifts_enabled"
          checked={enabled}
          onCheckedChange={(checked) => {
            onEnabledChange(checked);
            if (checked && accounts.length === 0) {
              onAccountsChange([emptyBankAccountDraft()]);
            }
          }}
        />
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">Please note:</span> we do not take
          responsibility for cash gifts or bank transfers. We only show your
          account details to your guests. Transfers happen between the guest and
          you, outside this app.
        </p>
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">Bank accounts</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAccountsChange([...accounts, emptyBankAccountDraft()])}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add bank
            </Button>
          </div>

          {accounts.map((account, index) => (
            <div
              key={account.clientId}
              className="space-y-3 rounded-xl border border-gray-200 p-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Account {index + 1}</p>
                {accounts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() =>
                      onAccountsChange(accounts.filter((item) => item.clientId !== account.clientId))
                    }
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Select
                    value={account.bank_name || undefined}
                    onValueChange={(value) => updateAccount(account.clientId, { bank_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {SRI_LANKAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {account.bank_name === "Other" && (
                  <div className="space-y-2">
                    <Label>Bank name</Label>
                    <Input
                      value={account.custom_bank_name}
                      onChange={(e) =>
                        updateAccount(account.clientId, { custom_bank_name: e.target.value })
                      }
                      placeholder="Enter bank name"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Account holder name</Label>
                  <Input
                    value={account.account_name}
                    onChange={(e) =>
                      updateAccount(account.clientId, { account_name: e.target.value })
                    }
                    placeholder="Name on the account"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account number</Label>
                  <Input
                    value={account.account_number}
                    onChange={(e) =>
                      updateAccount(account.clientId, { account_number: e.target.value })
                    }
                    placeholder="Account number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Branch (optional)</Label>
                  <Input
                    value={account.branch}
                    onChange={(e) => updateAccount(account.clientId, { branch: e.target.value })}
                    placeholder="Branch name"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
