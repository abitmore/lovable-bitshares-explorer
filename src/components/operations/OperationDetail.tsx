import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AccountLink, AssetAmount, ObjectId, DetailRow } from "./OperationHelpers";

export function OperationDetail({ opType, opData, accounts, assets }: {
  opType: number; opData: any; accounts: Record<string, any>; assets: Record<string, any>;
}) {
  switch (opType) {
    // 0: Transfer
    case 0:
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <AccountLink id={opData.from} accounts={accounts} />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <AccountLink id={opData.to} accounts={accounts} />
          <span className="text-muted-foreground">·</span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
          {opData.memo && <Badge variant="outline" className="text-xs">memo</Badge>}
        </div>
      );

    // 1: Limit Order Create
    case 1:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Seller"><AccountLink id={opData.seller} accounts={accounts} /></DetailRow>
          <DetailRow label="Selling"><AssetAmount amount={opData.amount_to_sell.amount} assetId={opData.amount_to_sell.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="For at least"><AssetAmount amount={opData.min_to_receive.amount} assetId={opData.min_to_receive.asset_id} assets={assets} /></DetailRow>
          {opData.fill_or_kill && <Badge variant="outline" className="text-xs">fill or kill</Badge>}
        </div>
      );

    // 2: Limit Order Cancel
    case 2:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> cancelled order </span>
          <ObjectId id={opData.order} />
        </div>
      );

    // 3: Call Order Update
    case 3:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.funding_account} accounts={accounts} /></DetailRow>
          <DetailRow label="Collateral delta"><AssetAmount amount={opData.delta_collateral.amount} assetId={opData.delta_collateral.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Debt delta"><AssetAmount amount={opData.delta_debt.amount} assetId={opData.delta_debt.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 4: Fill Order (virtual)
    case 4:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account_id} accounts={accounts} /></DetailRow>
          <DetailRow label="Paid"><AssetAmount amount={opData.pays.amount} assetId={opData.pays.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Received"><AssetAmount amount={opData.receives.amount} assetId={opData.receives.asset_id} assets={assets} /></DetailRow>
          {opData.is_maker !== undefined && <Badge variant="outline" className="text-xs">{opData.is_maker ? "maker" : "taker"}</Badge>}
        </div>
      );

    // 5: Account Create
    case 5: {
      const showReferrer = opData.referrer && opData.referrer !== opData.registrar;
      return (
        <div className="text-sm">
          <AccountLink id={opData.registrar} accounts={accounts} />
          <span className="text-muted-foreground"> registered </span>
          <Link to={`/account/${opData.name}`} className="text-primary hover:underline font-semibold">{opData.name}</Link>
          {showReferrer && (
            <>
              <span className="text-muted-foreground"> (referrer: </span>
              <AccountLink id={opData.referrer} accounts={accounts} />
              <span className="text-muted-foreground">)</span>
            </>
          )}
        </div>
      );
    }

    // 6: Account Update
    case 6:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> updated account settings</span>
        </div>
      );

    // 7: Account Whitelist
    case 7:
      return (
        <div className="text-sm">
          <AccountLink id={opData.authorizing_account} accounts={accounts} />
          <span className="text-muted-foreground"> {opData.new_listing === 1 ? "whitelisted" : opData.new_listing === 2 ? "blacklisted" : "delisted"} </span>
          <AccountLink id={opData.account_to_list} accounts={accounts} />
        </div>
      );

    // 8: Account Upgrade
    case 8:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account_to_upgrade} accounts={accounts} />
          <span className="text-muted-foreground"> upgraded to </span>
          <span className="font-semibold">{opData.upgrade_to_lifetime_member ? "lifetime member" : "annual member"}</span>
        </div>
      );

    // 9: Account Transfer
    case 9:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account_id} accounts={accounts} />
          <span className="text-muted-foreground"> transferred ownership to </span>
          <AccountLink id={opData.new_owner} accounts={accounts} />
        </div>
      );

    // 10: Asset Create
    case 10:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> created asset </span>
          <span className="font-semibold">{opData.symbol}</span>
        </div>
      );

    // 11: Asset Update
    case 11:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> updated asset </span>
          <ObjectId id={opData.asset_to_update} />
        </div>
      );

    // 12: Asset Update Bitasset
    case 12:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> updated bitasset options for </span>
          <ObjectId id={opData.asset_to_update} />
        </div>
      );

    // 13: Asset Update Feed Producers
    case 13:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> updated feed producers for </span>
          <ObjectId id={opData.asset_to_update} />
        </div>
      );

    // 14: Asset Issue
    case 14:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> issued </span>
          <AssetAmount amount={opData.asset_to_issue.amount} assetId={opData.asset_to_issue.asset_id} assets={assets} />
          <span className="text-muted-foreground"> to </span>
          <AccountLink id={opData.issue_to_account} accounts={accounts} />
        </div>
      );

    // 15: Asset Reserve
    case 15:
      return (
        <div className="text-sm">
          <AccountLink id={opData.payer} accounts={accounts} />
          <span className="text-muted-foreground"> burned </span>
          <AssetAmount amount={opData.amount_to_reserve.amount} assetId={opData.amount_to_reserve.asset_id} assets={assets} />
        </div>
      );

    // 16: Asset Fund Fee Pool
    case 16:
      return (
        <div className="text-sm">
          <AccountLink id={opData.from_account} accounts={accounts} />
          <span className="text-muted-foreground"> funded fee pool of </span>
          <ObjectId id={opData.asset_id} />
          <span className="text-muted-foreground"> with </span>
          <span className="font-semibold">{Number(opData.amount) / 1e5} BTS</span>
        </div>
      );

    // 17: Asset Settle
    case 17:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> settled </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 18: Asset Global Settle
    case 18:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> globally settled </span>
          <ObjectId id={opData.asset_to_settle} />
        </div>
      );

    // 19: Asset Publish Feed
    case 19:
      return (
        <div className="text-sm">
          <AccountLink id={opData.publisher} accounts={accounts} />
          <span className="text-muted-foreground"> published feed for </span>
          <ObjectId id={opData.asset_id} />
        </div>
      );

    // 20: Witness Create
    case 20:
      return (
        <div className="text-sm">
          <AccountLink id={opData.witness_account} accounts={accounts} />
          <span className="text-muted-foreground"> created a witness</span>
        </div>
      );

    // 21: Witness Update
    case 21:
      return (
        <div className="text-sm">
          <AccountLink id={opData.witness_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated witness </span>
          <ObjectId id={opData.witness} />
        </div>
      );

    // 22: Proposal Create
    case 22:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> created proposal with {opData.proposed_ops?.length ?? 0} operation(s)</span>
        </div>
      );

    // 23: Proposal Update
    case 23:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated proposal </span>
          <ObjectId id={opData.proposal} />
        </div>
      );

    // 24: Proposal Delete
    case 24:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted proposal </span>
          <ObjectId id={opData.proposal} />
        </div>
      );

    // 25: Withdraw Permission Create
    case 25:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="From"><AccountLink id={opData.withdraw_from_account} accounts={accounts} /></DetailRow>
          <DetailRow label="Authorized"><AccountLink id={opData.authorized_account} accounts={accounts} /></DetailRow>
          <DetailRow label="Limit"><AssetAmount amount={opData.withdrawal_limit.amount} assetId={opData.withdrawal_limit.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 26: Withdraw Permission Update
    case 26:
      return (
        <div className="text-sm">
          <AccountLink id={opData.withdraw_from_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated withdraw permission for </span>
          <AccountLink id={opData.authorized_account} accounts={accounts} />
        </div>
      );

    // 27: Withdraw Permission Claim
    case 27:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="From"><AccountLink id={opData.withdraw_from_account} accounts={accounts} /></DetailRow>
          <DetailRow label="To"><AccountLink id={opData.withdraw_to_account} accounts={accounts} /></DetailRow>
          <DetailRow label="Amount"><AssetAmount amount={opData.amount_to_withdraw.amount} assetId={opData.amount_to_withdraw.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 28: Withdraw Permission Delete
    case 28:
      return (
        <div className="text-sm">
          <AccountLink id={opData.withdraw_from_account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted withdraw permission for </span>
          <AccountLink id={opData.authorized_account} accounts={accounts} />
        </div>
      );

    // 29: Committee Member Create
    case 29:
      return (
        <div className="text-sm">
          <AccountLink id={opData.committee_member_account} accounts={accounts} />
          <span className="text-muted-foreground"> created a committee member</span>
        </div>
      );

    // 30: Committee Member Update
    case 30:
      return (
        <div className="text-sm">
          <AccountLink id={opData.committee_member_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated committee member </span>
          <ObjectId id={opData.committee_member} />
        </div>
      );

    // 31: Committee Member Update Global Parameters
    case 31:
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">Committee proposed global parameter changes</span>
        </div>
      );

    // 32: Vesting Balance Create
    case 32:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Creator"><AccountLink id={opData.creator} accounts={accounts} /></DetailRow>
          <DetailRow label="Owner"><AccountLink id={opData.owner} accounts={accounts} /></DetailRow>
          <DetailRow label="Amount"><AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 33: Vesting Balance Withdraw
    case 33:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner} accounts={accounts} />
          <span className="text-muted-foreground"> withdrew </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 34: Worker Create
    case 34:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Owner"><AccountLink id={opData.owner} accounts={accounts} /></DetailRow>
          <div><span className="text-muted-foreground">Name: </span><span className="font-semibold">{opData.name}</span></div>
          <DetailRow label="Daily pay"><span className="font-semibold">{Number(opData.daily_pay) / 1e5} BTS</span></DetailRow>
        </div>
      );

    // 35: Custom
    case 35:
      return (
        <div className="text-sm">
          <AccountLink id={opData.payer} accounts={accounts} />
          <span className="text-muted-foreground"> custom operation (id: {opData.id})</span>
        </div>
      );

    // 36: Assert
    case 36:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> assert operation</span>
        </div>
      );

    // 37: Balance Claim
    case 37:
      return (
        <div className="text-sm">
          <AccountLink id={opData.deposit_to_account} accounts={accounts} />
          <span className="text-muted-foreground"> claimed balance </span>
          <AssetAmount amount={opData.total_claimed.amount} assetId={opData.total_claimed.asset_id} assets={assets} />
        </div>
      );

    // 38: Override Transfer
    case 38:
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground">overrode transfer</span>
          <AccountLink id={opData.from} accounts={accounts} />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <AccountLink id={opData.to} accounts={accounts} />
          <span className="text-muted-foreground">·</span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 39: Transfer to Blind
    case 39:
      return (
        <div className="text-sm">
          <AccountLink id={opData.from} accounts={accounts} />
          <span className="text-muted-foreground"> transferred </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
          <span className="text-muted-foreground"> to blinded balance</span>
        </div>
      );

    // 40: Blind Transfer
    case 40:
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">Blind transfer ({opData.inputs?.length ?? 0} inputs → {opData.outputs?.length ?? 0} outputs)</span>
        </div>
      );

    // 41: Transfer from Blind
    case 41:
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">Transferred from blinded balance to </span>
          <AccountLink id={opData.to} accounts={accounts} />
          <span className="text-muted-foreground"> · </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 42: Asset Settle Cancel (virtual)
    case 42:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> settlement cancelled </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 43: Asset Claim Fees
    case 43:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> claimed fees </span>
          <AssetAmount amount={opData.amount_to_claim.amount} assetId={opData.amount_to_claim.asset_id} assets={assets} />
        </div>
      );

    // 44: FBA Distribute (virtual)
    case 44:
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">FBA distribution to </span>
          <AccountLink id={opData.account_id} accounts={accounts} />
        </div>
      );

    // 45: Bid Collateral
    case 45:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Bidder"><AccountLink id={opData.bidder} accounts={accounts} /></DetailRow>
          <DetailRow label="Collateral"><AssetAmount amount={opData.additional_collateral.amount} assetId={opData.additional_collateral.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Debt covered"><AssetAmount amount={opData.debt_covered.amount} assetId={opData.debt_covered.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 46: Execute Bid (virtual)
    case 46:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Bidder"><AccountLink id={opData.bidder} accounts={accounts} /></DetailRow>
          <DetailRow label="Debt"><AssetAmount amount={opData.debt.amount} assetId={opData.debt.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Collateral"><AssetAmount amount={opData.collateral.amount} assetId={opData.collateral.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 47: Asset Claim Pool
    case 47:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> claimed </span>
          <AssetAmount amount={opData.amount_to_claim.amount} assetId={opData.amount_to_claim.asset_id} assets={assets} />
          <span className="text-muted-foreground"> from fee pool of </span>
          <ObjectId id={opData.asset_id} />
        </div>
      );

    // 48: Asset Update Issuer
    case 48:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> transferred issuer of </span>
          <ObjectId id={opData.asset_to_update} />
          <span className="text-muted-foreground"> to </span>
          <AccountLink id={opData.new_issuer} accounts={accounts} />
        </div>
      );

    // 49: HTLC Create
    case 49:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="From"><AccountLink id={opData.from} accounts={accounts} /></DetailRow>
          <DetailRow label="To"><AccountLink id={opData.to} accounts={accounts} /></DetailRow>
          <DetailRow label="Amount"><AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 50: HTLC Redeem
    case 50:
      return (
        <div className="text-sm">
          <AccountLink id={opData.redeemer} accounts={accounts} />
          <span className="text-muted-foreground"> redeemed HTLC </span>
          <ObjectId id={opData.htlc_id} />
        </div>
      );

    // 51: HTLC Redeemed (virtual)
    case 51:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="From"><AccountLink id={opData.from} accounts={accounts} /></DetailRow>
          <DetailRow label="To"><AccountLink id={opData.to} accounts={accounts} /></DetailRow>
          <DetailRow label="Redeemer"><AccountLink id={opData.redeemer} accounts={accounts} /></DetailRow>
          <DetailRow label="Amount"><AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 52: HTLC Extend
    case 52:
      return (
        <div className="text-sm">
          <AccountLink id={opData.update_issuer} accounts={accounts} />
          <span className="text-muted-foreground"> extended HTLC </span>
          <ObjectId id={opData.htlc_id} />
        </div>
      );

    // 53: HTLC Refund (virtual)
    case 53:
      return (
        <div className="text-sm">
          <AccountLink id={opData.to} accounts={accounts} />
          <span className="text-muted-foreground"> HTLC refunded </span>
          <ObjectId id={opData.htlc_id} />
        </div>
      );

    // 54: Custom Authority Create
    case 54:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> created custom authority</span>
        </div>
      );

    // 55: Custom Authority Update
    case 55:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> updated custom authority </span>
          <ObjectId id={opData.authority_to_update} />
        </div>
      );

    // 56: Custom Authority Delete
    case 56:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted custom authority </span>
          <ObjectId id={opData.authority_to_delete} />
        </div>
      );

    // 57: Ticket Create
    case 57:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> created ticket · </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );

    // 58: Ticket Update
    case 58:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> updated ticket </span>
          <ObjectId id={opData.ticket} />
        </div>
      );

    // 59: Liquidity Pool Create
    case 59:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account} accounts={accounts} /></DetailRow>
          <div className="text-muted-foreground">
            Assets: <ObjectId id={opData.asset_a} /> / <ObjectId id={opData.asset_b} />
          </div>
        </div>
      );

    // 60: Liquidity Pool Delete
    case 60:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted pool </span>
          <ObjectId id={opData.pool} />
        </div>
      );

    // 61: Liquidity Pool Deposit
    case 61:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account} accounts={accounts} /></DetailRow>
          <DetailRow label="Pool"><ObjectId id={opData.pool} /></DetailRow>
          <DetailRow label="Amount A"><AssetAmount amount={opData.amount_a.amount} assetId={opData.amount_a.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Amount B"><AssetAmount amount={opData.amount_b.amount} assetId={opData.amount_b.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 62: Liquidity Pool Withdraw
    case 62:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account} accounts={accounts} /></DetailRow>
          <DetailRow label="Pool"><ObjectId id={opData.pool} /></DetailRow>
          <DetailRow label="Share amount"><AssetAmount amount={opData.share_amount.amount} assetId={opData.share_amount.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 63: Liquidity Pool Exchange
    case 63:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account} accounts={accounts} /></DetailRow>
          <DetailRow label="Pool"><ObjectId id={opData.pool} /></DetailRow>
          <DetailRow label="Selling"><AssetAmount amount={opData.amount_to_sell.amount} assetId={opData.amount_to_sell.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Min receive"><AssetAmount amount={opData.min_to_receive.amount} assetId={opData.min_to_receive.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 64: SameT Fund Create
    case 64:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner_account} accounts={accounts} />
          <span className="text-muted-foreground"> created SameT Fund · </span>
          <AssetAmount amount={opData.balance.amount} assetId={opData.balance.asset_id} assets={assets} />
        </div>
      );

    // 65: SameT Fund Delete
    case 65:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner_account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted SameT Fund </span>
          <ObjectId id={opData.fund_id} />
        </div>
      );

    // 66: SameT Fund Update
    case 66:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated SameT Fund </span>
          <ObjectId id={opData.fund_id} />
        </div>
      );

    // 67: SameT Fund Borrow
    case 67:
      return (
        <div className="text-sm">
          <AccountLink id={opData.borrower} accounts={accounts} />
          <span className="text-muted-foreground"> borrowed from SameT Fund </span>
          <ObjectId id={opData.fund_id} />
          <span className="text-muted-foreground"> · </span>
          <AssetAmount amount={opData.borrow_amount.amount} assetId={opData.borrow_amount.asset_id} assets={assets} />
        </div>
      );

    // 68: SameT Fund Repay
    case 68:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> repaid SameT Fund </span>
          <ObjectId id={opData.fund_id} />
          <span className="text-muted-foreground"> · </span>
          <AssetAmount amount={opData.repay_amount.amount} assetId={opData.repay_amount.asset_id} assets={assets} />
        </div>
      );

    // 69: Credit Offer Create
    case 69:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Owner"><AccountLink id={opData.owner_account} accounts={accounts} /></DetailRow>
          <DetailRow label="Asset type"><ObjectId id={opData.asset_type} /></DetailRow>
          <DetailRow label="Balance"><span className="font-semibold">{opData.balance}</span></DetailRow>
        </div>
      );

    // 70: Credit Offer Delete
    case 70:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner_account} accounts={accounts} />
          <span className="text-muted-foreground"> deleted credit offer </span>
          <ObjectId id={opData.offer_id} />
        </div>
      );

    // 71: Credit Offer Update
    case 71:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner_account} accounts={accounts} />
          <span className="text-muted-foreground"> updated credit offer </span>
          <ObjectId id={opData.offer_id} />
        </div>
      );

    // 72: Credit Offer Accept
    case 72:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Borrower"><AccountLink id={opData.borrower} accounts={accounts} /></DetailRow>
          <DetailRow label="Offer"><ObjectId id={opData.offer_id} /></DetailRow>
          <DetailRow label="Borrow amount"><AssetAmount amount={opData.borrow_amount.amount} assetId={opData.borrow_amount.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Collateral"><AssetAmount amount={opData.collateral.amount} assetId={opData.collateral.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 73: Credit Deal Repay
    case 73:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Account"><AccountLink id={opData.account} accounts={accounts} /></DetailRow>
          <DetailRow label="Deal"><ObjectId id={opData.deal_id} /></DetailRow>
          <DetailRow label="Repay amount"><AssetAmount amount={opData.repay_amount.amount} assetId={opData.repay_amount.asset_id} assets={assets} /></DetailRow>
          <DetailRow label="Credit fee"><AssetAmount amount={opData.credit_fee.amount} assetId={opData.credit_fee.asset_id} assets={assets} /></DetailRow>
        </div>
      );

    // 74: Credit Deal Expired (virtual)
    case 74:
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">Credit deal </span>
          <ObjectId id={opData.deal_id} />
          <span className="text-muted-foreground"> expired for </span>
          <AccountLink id={opData.borrower} accounts={accounts} />
        </div>
      );

    // 75: Liquidity Pool Update
    case 75:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> updated pool </span>
          <ObjectId id={opData.pool} />
        </div>
      );

    // 76: Credit Deal Update
    case 76:
      return (
        <div className="text-sm">
          <AccountLink id={opData.account} accounts={accounts} />
          <span className="text-muted-foreground"> updated credit deal </span>
          <ObjectId id={opData.deal_id} />
        </div>
      );

    // 77: Limit Order Update
    case 77:
      return (
        <div className="space-y-1 text-sm">
          <DetailRow label="Seller"><AccountLink id={opData.seller} accounts={accounts} /></DetailRow>
          <DetailRow label="Order"><ObjectId id={opData.order} /></DetailRow>
          {opData.new_price && <div className="text-muted-foreground text-xs">Price updated</div>}
          {opData.delta_amount_to_sell && (
            <DetailRow label="Amount delta"><AssetAmount amount={opData.delta_amount_to_sell.amount} assetId={opData.delta_amount_to_sell.asset_id} assets={assets} /></DetailRow>
          )}
        </div>
      );

    default:
      return (
        <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-48">
          {JSON.stringify(opData, null, 2)}
        </pre>
      );
  }
}
