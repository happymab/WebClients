import { useActiveBreakpoint } from '@proton/components/hooks';

import { DownloadButton, DownloadButtonProps } from './DownloadButton';
import ReportAbuseButton from './ReportAbuseButton';

import './SharedPageFooter.scss';

interface Props extends DownloadButtonProps {}
const SharedPageFooter = ({ rootItem, items, onDownload }: Props) => {
    const { isNarrow } = useActiveBreakpoint();

    if (isNarrow && items.length > 0) {
        return (
            <div className="fixed bottom p1 flex flex-justify-center bg-weak w100">
                <DownloadButton
                    className="flex-item flex-item-fluid"
                    rootItem={rootItem}
                    items={items}
                    onDownload={onDownload}
                />
            </div>
        );
    }
    return <ReportAbuseButton className="shared-page-footer-report fixed" linkInfo={rootItem} />;
};

export default SharedPageFooter;
