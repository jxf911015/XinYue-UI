import $ from "jquery";
let infoModule = {
  getDom: function (dataId, name, column, avgWidth, height) {
    let self = this;
    let div = $('<div class="sense-control" id="ID_' + dataId + '"></div>');
    div.css('width', column * avgWidth + 'px');
    div.css('height', height + 'px');
    div.css('transform', 'translate(' + 0 + 'px, ' + 0 + 'px)');
    div.attr('field_column', column);
    div.attr('field_name', name);
    let wrapper = $('<div class="sense-control-wrapper"></div>');
    div.append(wrapper);
    let span = $('<div class="sense-control-name">' + name + '</div>');
    wrapper.append(span);
    return div;
  }
}

export default infoModule;
