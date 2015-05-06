'use strict';

var React = require('react');
var colors = require('material-ui/lib/styles/colors');

var locale = require('../../locale');
var polyglot = require('../../polyglot');

var ListBalance = React.createClass({
  propTypes: {
    account: React.PropTypes.object.isRequired,
  },

  render: function() {
    var negativesStyle = {
      color: colors.pink500,
    };

    var positivesStyle = {
      color: colors.green600,
    };

    var neutraleStyle = {
      color: colors.grey600,
    };

    var member = this.props.account.members[0]; // Me
    var balances = member.balances.filter(function(balance) {
      return balance.value !== 0;
    });

    if (balances.length > 0) {
      var positives = [];
      var negatives = [];

      balances.forEach(function(balance) {
        var text = new locale.intl.NumberFormat(locale.current, { style: 'currency', currency: balance.currency })
          .format(Math.abs(balance.value));

        if(balance.value < 0) {
          negatives.push(
            <div className="mui-font-style-title" key={balance.currency} style={negativesStyle}>
              {text}
            </div>
          );
        } else { // > 0
          positives.push(
            <div className="mui-font-style-title" key={balance.currency} style={positivesStyle}>
              {text}
            </div>
          );
        }
      });

      var balancesNode = [];

      if(negatives.length) {
        balancesNode.push(<div className="account-balance-you-owe" key="negatives">
            <div className="mui-font-style-body-1" style={negativesStyle}>{polyglot.t('you_owe')}</div>
            {negatives}
          </div>
        );
      }

      if(positives.length) {
        balancesNode.push(<div className="account-balance-owes-you" key="positives">
            <div className="mui-font-style-body-1" style={positivesStyle}>{polyglot.t('owes_you')}</div>
            {positives}
          </div>
        );
      }
      return <div>{balancesNode}</div>;
    } else {
      return <span className="account-balance-settled-up" style={neutraleStyle}>
          {polyglot.t('settled_up')}
        </span>;
    }
  },
});

module.exports = ListBalance;